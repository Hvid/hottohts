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

    constructor(address: string = "192.168.4.10", port: number = 5001, id: number = 0) {
        this.address = address;
        this.port = port;
        this._socket = new net.Socket();
    }

    /**
     * Connect to the stove over TCP.
     * @returns Promise that resolves when connected.
     */
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._socket.connect(this.port, this.address, () => {
                this.__isConnected = true;
                resolve();
            });
            this._socket.on('error', (err: Error) => {
                this.__isConnected = false;
                reject(err);
            });
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
            const cleanup = () => {
                if (timeout) clearTimeout(timeout);
                this._socket.removeListener('data', onData);
                this._socket.removeListener('error', onError);
            };
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
            this._socket.on('data', onData);
            this._socket.on('error', onError);
            this._socket.write(request);
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
        if (!this.__endRequest) {
            this.loop();
        }
    }

    /**
     * Stop polling and disconnect.
     */
    public stop(): void {
        this.__endRequest = true;
        this._socket.end();
    }

    private loop(): void {
        if (this.__isConnected) {
            this.__dial();
        } else {
            this.__connect();
        }
    }

    private __connect(): void {
        try {
            this._socket.connect(this.port, this.address, () => {
                this.__isConnected = true;
                this.loop();
            });
        } catch (error: any) {
            this.__isConnected = false;
            if (error.code === 'EISCONN') {
                setTimeout(() => this.loop(), 5000);
            }
            setTimeout(() => this.loop(), 5000);
        }
        this._socket.on('error', (err: Error) => {
            this.__isConnected = false;
            setTimeout(() => this.loop(), 5000);
        });
    }

    private async __dial(): Promise<void> {
        if (!this.__isConnected) return;
        try {
            this._info = await this._get_data('INF', ['']);
            this._data = await this._get_data('DAT', ['0']);
            this._data2 = await this._get_data('DAT', ['2']);
            while (this._writeParameters.length > 0) {
                const param = this._writeParameters[0];
                await this._set_data(param);
                this._writeParameters.shift();
            }
            this._writeParameters = [];
            this._writeRequest = false;
            setTimeout(() => this.loop(), 1000);
        } catch (error) {
            this.__isConnected = false;
            setTimeout(() => this.loop(), 5000);
        }
    }

    private __disconnect(): void {
        this.__isConnected = false;
        this._socket.end();
    }
}