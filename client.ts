/**
 * hottohts - TCP/IP client for HottoH pellet stoves (TypeScript)
 *
 * Provides a low-level TCP client for communicating with HottoH stoves using the official protocol.
 * Handles connection, polling, and command sending. Used internally by the Hottoh high-level API.
 *
 * @module client
 */
import * as net from 'net';
import { Request, CommandMode } from './request';
import { Buffer } from 'buffer';
import { EventEmitter } from 'events';

/**
 * Low-level TCP client for HottoH stoves. Handles protocol communication and polling.
 * Not intended for direct use; use the Hottoh class for most applications.
 */
export class HottohRemoteClient {
    private address: string;
    private port: number;
    private _info: string[] | null = null;
    private _data: string[] | null = null;
    private _data2: string[] | null = null;
    private _raw: string | null = null;
    private _writeRequest: boolean = false;
    private _writeParameters: string[][] = [];
    private _disconnectRequest: boolean = false;
    private _socket: net.Socket;
    private __isConnected: boolean = false;
    private __endRequest: boolean = false;
    private _responseBuffer: string = '';
    private _pendingResponse: ((data: string) => void) | null = null;
    private _loopTimeout: NodeJS.Timeout | null = null;
    private _eventHandlers: Map<string, (...args: any[]) => void> = new Map();

    constructor(address: string = "192.168.4.10", port: number = 5001, id: number = 0) {
        this.address = address;
        this.port = port;
        this._socket = new net.Socket();
        this._setupSocketEventHandlers();
    }

    /**
     * Set up persistent event handlers for the socket
     * These handlers remain throughout the lifecycle of the client
     */
    private _setupSocketEventHandlers(): void {
        const errorHandler = (err: Error) => {
            this.__isConnected = false;
        };

        const closeHandler = () => {
            this.__isConnected = false;
        };

        const endHandler = () => {
            this.__isConnected = false;
        };

        this._socket.on('close', closeHandler);
        this._socket.on('end', endHandler);
        this._socket.on('error', errorHandler);

        // Store handlers for potential cleanup
        this._eventHandlers.set('close', closeHandler);
        this._eventHandlers.set('end', endHandler);
        this._eventHandlers.set('error', errorHandler);
    }

    /**
     * Clean up and reset the socket
     */
    private _resetSocket(): void {
        // Create a new socket and set up handlers again
        if (this._socket) {
            // Remove all listeners
            this._socket.removeAllListeners();
            
            // Ensure socket is closed
            try {
                this._socket.destroy();
            } catch (e) {
                // Ignore errors on destroy
            }
        }
        
        this._socket = new net.Socket();
        this._setupSocketEventHandlers();
    }

    /**
     * Connect to the stove over TCP.
     * @returns Promise that resolves when connected.
     */
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Clean up any existing connection first
            if (this.__isConnected) {
                this._resetSocket();
            }

            const connectHandler = () => {
                this.__isConnected = true;
                this._socket.removeListener('connect', connectHandler);
                this._socket.removeListener('error', errorHandler);
                resolve();
            };

            const errorHandler = (err: Error) => {
                this.__isConnected = false;
                this._socket.removeListener('connect', connectHandler);
                this._socket.removeListener('error', errorHandler);
                reject(err);
            };

            this._socket.once('connect', connectHandler);
            this._socket.once('error', errorHandler);
            
            this._socket.connect(this.port, this.address);
        });
    }

    /**
     * Check if the stove is reachable and protocol is working.
     * @returns Promise<boolean>
     */
    public async check(): Promise<boolean> {
        try {
            await this.connect();
            const data = await this._get_data("DAT", ["0"]);
            this._socket.end();
            return data.length > 0;
        } catch (err) {
            return false;
        }
    }

    /**
     * Returns true if the TCP socket is connected.
     */
    public isConnected(): boolean {
        return this.__isConnected;
    }

    private _extractData(data: string): string[] {
        return data.split(';');
    }

    private async _sendRequestAndWaitForResponse(request: Buffer): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let timeout: NodeJS.Timeout | null = null;
            
            const onData = (data: Buffer) => {
                this._responseBuffer += data.toString('utf-8');
                if (this._responseBuffer.includes('\n')) {
                    const [response] = this._responseBuffer.split('\n');
                    this._responseBuffer = '';
                    cleanup();
                    resolve(this._extractData(response));
                }
            };
            
            const onError = (err: Error) => {
                cleanup();
                reject(err);
            };

            const cleanup = () => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                this._socket.removeListener('data', onData);
                this._socket.removeListener('error', onError);
            };
            
            // Add temporary listeners for this request only
            this._socket.on('data', onData);
            this._socket.on('error', onError);
            
            // Send the request
            this._socket.write(request);
            
            // Set a timeout to prevent hanging
            timeout = setTimeout(() => {
                cleanup();
                reject(new Error('Socket timeout'));
            }, 60000);
        });
    }

    private async _get_data(command: string, parameters: string[]): Promise<string[]> {
        const request = new Request(command, CommandMode.READ, parameters);
        return this._sendRequestAndWaitForResponse(request.getRequest());
    }

    private async _set_data(parameters: string[]): Promise<string[]> {
        const request = new Request('DAT', CommandMode.WRITE, parameters);
        return this._sendRequestAndWaitForResponse(request.getRequest());
    }

    private async _set_raw(command: string, mode: string, parameters: string[]): Promise<string[]> {
        const request = new Request(command, mode as CommandMode, parameters);
        return this._sendRequestAndWaitForResponse(request.getRequest());
    }

    /**
     * Send a command to the stove (queued for next poll cycle).
     * @param parameters Command parameters as string array
     * @returns true if queued
     */
    public sendCommand(parameters: string[]): boolean {
        this._writeRequest = true;
        this._writeParameters.push(parameters);
        return true;
    }

    /**
     * Start polling the stove for data.
     */
    public start(): void {
        this.__endRequest = false;
        this.loop();
    }

    /**
     * Stop polling and disconnect.
     */
    public stop(): void {
        this.__endRequest = true;
        
        // Clear any pending timeouts
        if (this._loopTimeout) {
            clearTimeout(this._loopTimeout);
            this._loopTimeout = null;
        }
        
        // Clean up connection
        this.__disconnect();
    }

    private loop(): void {
        // Clear any existing timeout
        if (this._loopTimeout) {
            clearTimeout(this._loopTimeout);
            this._loopTimeout = null;
        }
        
        if (this.__endRequest) return;
        
        if (this.__isConnected) {
            this.__dial();
        } else {
            this.__connect();
        }
    }

    private __connect(): void {
        try {
            const connectHandler = () => {
                this.__isConnected = true;
                this._socket.removeListener('connect', connectHandler);
                this.loop();
            };

            this._socket.once('connect', connectHandler);
            this._socket.connect(this.port, this.address);
        } catch (error: any) {
            this.__isConnected = false;
            
            if (error && error.code === 'EISCONN') {
                // Already connected, continue with loop
                this.__isConnected = true;
                this._loopTimeout = setTimeout(() => this.loop(), 1000);
                return;
            }
            
            // Retry connection after delay
            this._loopTimeout = setTimeout(() => this.loop(), 5000);
        }
    }

    private async __dial(): Promise<void> {
        if (!this.__isConnected || this.__endRequest) return;
        
        try {
            this._info = await this._get_data('INF', ['']);
            this._data = await this._get_data('DAT', ['0']);
            this._data2 = await this._get_data('DAT', ['2']);
            
            // Process any queued write commands
            while (this._writeParameters.length > 0 && !this.__endRequest) {
                const param = this._writeParameters[0];
                await this._set_data(param);
                this._writeParameters.shift();
            }
            
            this._writeRequest = false;
            
            // Schedule next poll if not stopping
            if (!this.__endRequest) {
                this._loopTimeout = setTimeout(() => this.loop(), 1000);
            }
        } catch (error) {
            this.__isConnected = false;
            
            // If we're not stopping, try to reconnect
            if (!this.__endRequest) {
                this._loopTimeout = setTimeout(() => this.loop(), 5000);
            }
        }
    }

    private __disconnect(): void {
        this.__isConnected = false;
        
        try {
            this._socket.end();
        } catch (e) {
            // Ignore errors on end
        }
    }
    
    /**
     * Clean up all resources
     * Call this when done with the client to prevent memory leaks
     */
    public dispose(): void {
        this.stop();
        
        // Ensure all event handlers are removed
        if (this._socket) {
            this._socket.removeAllListeners();
            try {
                this._socket.destroy();
            } catch (e) {
                // Ignore errors on destroy
            }
        }
        
        // Clear all references
        this._socket = null as any;
        this._eventHandlers.clear();
        this._info = null;
        this._data = null;
        this._data2 = null;
        this._raw = null;
        this._writeParameters = [];
    }
}