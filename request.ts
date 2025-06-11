/**
 * hottohts - Protocol request/packet builder for HottoH stoves
 *
 * Handles CRC, packet formatting, and protocol details for all commands.
 * Ported 1:1 from Hottohpy for protocol compatibility.
 *
 * @module request
 */
import * as crc from 'crc';

export enum Command {
    DAT = "DAT",
}

export enum CommandMode {
    READ = "R",
    WRITE = "W",
    EXECUTE = "E",
}

/**
 * Build and encode a protocol request for the HottoH stove.
 */
export class Request {
    private command: string;
    private mode: string;
    private parameters: string[];
    private id: number;
    private request: string = "";

    constructor(command: string = Command.DAT, mode: string = CommandMode.READ, parameters: string[] = ["0"], id: number = 0) {
        this.command = command;
        this.mode = mode;
        this.parameters = parameters;
        this.id = id;
        this._buildRawPacket();
    }

    private _buildRawPacket(): void {
        // Python: strSocketId = str(0).zfill(5)
        // TypeScript: always use 0 for socket id for parity
        const strSocketId = '00000';
        const strRawData = this._getRawData();
        const strData = `${strSocketId}C---${strRawData}`;
        const strCrc = this._getCrc(strData);
        this.request = `#${strData}${strCrc}\n`;
    }

    private _getRawData(): string {
        // Python: lenParameters = f"{len(self._getParameters()):0>4X}"
        // TypeScript: getParameters().length, pad to 4 hex digits
        const paramString = this._getParameters();
        const lenParameters = paramString.length.toString(16).toUpperCase().padStart(4, '0');
        return `${lenParameters}${this.command}${this.mode}${paramString}`;
    }

    private _getParameters(): string {
        return this.parameters.join(';') + ";";
    }

    private _getCrc(message: string): string {
        // Python: crc-ccitt-false, which is crc16ccitt in npm 'crc'
        const crcValue = crc.crc16ccitt(Buffer.from(message, 'utf-8'));
        return crcValue.toString(16).toUpperCase().padStart(4, '0');
    }

    /**
     * Get the encoded request as a Buffer for TCP transmission.
     */
    public getRequest(): Buffer {
        return Buffer.from(this.request, 'utf-8');
    }
}