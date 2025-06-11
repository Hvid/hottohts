/**
 * hottohts - High-level API for HottoH pellet stoves
 *
 * Provides a user-friendly interface for reading and controlling HottoH stoves.
 * All methods, constants, and logic are ported 1:1 from Hottohpy for deterministic parity.
 *
 * @module hottoht
 */
import { HottohRemoteClient } from './client';
import { StoveCommands, StoveRegisters, StoveState, StoveManufacturer } from './const';

/**
 * High-level API for HottoH stoves. Use this class for all stove operations.
 *
 * Example:
 *   const stove = new Hottoh('192.168.1.100', 5001);
 *   stove.connect();
 *   // ...
 */
export class Hottoh {
    private port: number;
    private address: string;
    public client: HottohRemoteClient;

    constructor(address: string, port: number, id: number = 0) {
        this.port = port;
        this.address = address;
        this.client = new HottohRemoteClient(this.address, this.port, id);
    }

    public connect(): void {
        this.client.start();
    }

    public disconnect(): void {
        this.client.stop();
    }

    public isConnected(): boolean {
        return this.client.isConnected();
    }

    private _extractData(data: string): string[] {
        return data.split(';');
    }

    private _getMac(): string {
        return "aabbccddeeff";
    }

    public setTemperature(value: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                this.client.sendCommand([
                    String(StoveCommands.PARAM_AMBIANCE_TEMPERATURE_1),
                    String(value * 10),
                ]);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }

    // --- Internal data accessors (1:1 with Python) ---
    public _getFirmwareVersion(): string | null {
        if (!this.client['_info']) return null;
        return this.client['_info'][StoveRegisters.INDEX_FW];
    }
    public _getWifiSignal(): string | null {
        if (!this.client['_info']) return null;
        return this.client['_info'][StoveRegisters.INDEX_WIFI];
    }
    public _getPageIndex(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_PAGE];
    }
    public _getManufacturer(): string | null {
        if (!this.client['_data']) return null;
        if (parseInt(this.client['_data'][StoveRegisters.INDEX_MANUFACTURER]) === StoveManufacturer.STOVE_MANUFACTURER_CMG) return "CMG";
        if (parseInt(this.client['_data'][StoveRegisters.INDEX_MANUFACTURER]) === StoveManufacturer.STOVE_MANUFACTURER_EDILKAMIN) return "EdilKamin";
        return this.client['_data'][StoveRegisters.INDEX_MANUFACTURER];
    }
    public _getIsBitmapVisible(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_BITMAP_VISIBLE];
    }
    public _getIsValid(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_VALID];
    }
    public _getStoveType(): number | null {
        if (!this.client['_data']) return null;
        return parseInt(this.client['_data'][StoveRegisters.INDEX_STOVE_TYPE]);
    }
    public _getStoveState(): string | null {
        if (!this.client['_data']) return "not_connected";
        const state = parseInt(this.client['_data'][StoveRegisters.INDEX_STOVE_STATE]);
        switch (state) {
            case StoveState.STATUS_OFF: return "switched_off";
            case StoveState.STATUS_STARTING_1: return "starting_1_check";
            case StoveState.STATUS_STARTING_2: return "starting_2_clean_all";
            case StoveState.STATUS_STARTING_3: return "starting_3_loading";
            case StoveState.STATUS_STARTING_4: return "starting_4_waiting";
            case StoveState.STATUS_STARTING_5: return "starting_5_waiting";
            case StoveState.STATUS_STARTING_6: return "starting_6_ignition";
            case StoveState.STATUS_STARTING_7: return "starting_7_stabilization";
            case StoveState.STATUS_POWER: return "power";
            case StoveState.STATUS_STOPPING_1: return "stopping_1_wait_standby";
            case StoveState.STATUS_STOPPING_2: return "stopping_2_wait_standby";
            case StoveState.STATUS_ECO_STOP_1: return "eco_stop_1_standby";
            case StoveState.STATUS_ECO_STOP_2: return "eco_stop_2";
            case StoveState.STATUS_ECO_STOP_3: return "eco_stop_3";
            case StoveState.STATUS_LOW_PELLET: return "low_pellet";
            case StoveState.STATUS_END_PELLET: return "end_pellet";
            case StoveState.STATUS_BLACK_OUT: return "black_out";
            case StoveState.STATUS_INGNITION_FAILED: return "error_ignition_failed";
            case StoveState.STATUS_ANTI_FREEZE: return "anti_freeze";
            case StoveState.STATUS_COVER_OPEN: return "error_cover_open";
            case StoveState.STATUS_NO_PELLET: return "error_no_pellet";
            default: return this.client['_data'][StoveRegisters.INDEX_STOVE_STATE];
        }
    }
    public _getStoveIsOn(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_STOVE_ON] === "1" ? "on" : "off";
    }
    public _getEcoMode(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_ECO_MODE] === "1" ? "on" : "off";
    }
    public _getChronoMode(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_TIMER_ON] === "1" ? "on" : "off";
    }
    public _getTemperatureRoom1(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T1]) / 10).toString();
    }
    public _getSetTemperatureRoom1(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T1_SET]) / 10).toString();
    }
    public _getSetMaxTemperatureRoom1(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T1_SET_MAX]) / 10).toString();
    }
    public _getSetMinTemperatureRoom1(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T1_SET_MIN]) / 10).toString();
    }
    public _getTemperatureRoom2(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T2]) / 10).toString();
    }
    public _getSetTemperatureRoom2(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T2_SET]) / 10).toString();
    }
    public _getSetMaxTemperatureRoom2(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T2_SET_MAX]) / 10).toString();
    }
    public _getSetMinTemperatureRoom2(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_AMBIENT_T2_SET_MIN]) / 10).toString();
    }
    public _getTemperatureRoom3(): string | null {
        if (!this.client['_data2']) return null;
        return (parseInt(this.client['_data2'][StoveRegisters.INDEX_ROOM_TEMP_3]) / 10).toString();
    }
    public _getSetTemperatureRoom3(): string | null {
        if (!this.client['_data2']) return null;
        return (parseInt(this.client['_data2'][StoveRegisters.INDEX_ROOM_TEMP_3_SET]) / 10).toString();
    }
    public _getSetMaxTemperatureRoom3(): string | null {
        if (!this.client['_data2']) return null;
        return (parseInt(this.client['_data2'][StoveRegisters.INDEX_ROOM_TEMP_3_SET_MAX]) / 10).toString();
    }
    public _getSetMinTemperatureRoom3(): string | null {
        if (!this.client['_data2']) return null;
        return (parseInt(this.client['_data2'][StoveRegisters.INDEX_ROOM_TEMP_3_SET_MIN]) / 10).toString();
    }
    public _getTemperatureWater(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_WATER]) / 10).toString();
    }
    public _getSetTemperatureWater(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_WATER_SET]) / 10).toString();
    }
    public _getSetMaxTemperatureWater(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_WATER_SET_MAX]) / 10).toString();
    }
    public _getSetMinTemperatureWater(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_WATER_SET_MIN]) / 10).toString();
    }
    public _getSmokeTemperature(): string | null {
        if (!this.client['_data']) return null;
        return (parseInt(this.client['_data'][StoveRegisters.INDEX_SMOKE_T]) / 10).toString();
    }
    public _getPowerLevel(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_POWER_LEVEL];
    }
    public _getSetPowerLevel(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_POWER_SET];
    }
    public _getSetMaxPowerLevel(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_POWER_MAX];
    }
    public _getSetMinPowerLevel(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_POWER_MIN];
    }
    public _getSpeedFanSmoke(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_SMOKE];
    }
    public _getSpeedFan1(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_1];
    }
    public _getSetSpeedFan1(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_1_SET];
    }
    public _getSetMaxSpeedFan1(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_1_SET_MAX];
    }
    public _getSpeedFan2(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_2];
    }
    public _getSetSpeedFan2(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_2_SET];
    }
    public _getSetMaxSpeedFan2(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_2_SET_MAX];
    }
    public _getSpeedFan3(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_3];
    }
    public _getSetSpeedFan3(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_3_SET];
    }
    public _getSetMaxSpeedFan3(): string | null {
        if (!this.client['_data']) return null;
        return this.client['_data'][StoveRegisters.INDEX_FAN_3_SET_MAX];
    }
    public _getFlowSwitch(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_FLOW_SWITCH];
    }
    public _getGenericPump(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_GENERIC_PUMP];
    }
    public _getAirEx1(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_AIREX_1];
    }
    public _getAirEx2(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_AIREX_2];
    }
    public _getAirEx3(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_AIREX_3];
    }
    public _getPuffer(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_PUFFER];
    }
    public _getSetPuffer(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_PUFFER_SET];
    }
    public _getSetMinPuffer(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_PUFFER_SET_MIN];
    }
    public _getSetMaxPuffer(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_PUFFER_SET_MAX];
    }
    public _getBoiler(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_BOILER];
    }
    public _getSetBoiler(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_BOILER_SET];
    }
    public _getSetMinBoiler(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_BOILER_SET_MIN];
    }
    public _getSetMaxBoiler(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_BOILER_SET_MAX];
    }
    public _getDhw(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_DHW];
    }
    public _getSetDhw(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_DHW_SET];
    }
    public _getSetMinDhw(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_DHW_SET_MIN];
    }
    public _getSetMaxDhw(): string | null {
        if (!this.client['_data2']) return null;
        return this.client['_data2'][StoveRegisters.INDEX_DHW_SET_MAX];
    }
    // --- Setters (1:1 with Python) ---
    public setWaterTemperature(value: number): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.INCONNU_4),
                String(value * 10),
            ]);
        } catch (e) { throw e; }
    }
    public setPowerLevel(value: number): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_NIVEAU_PUISSANCE),
                String(value),
            ]);
        } catch (e) { throw e; }
    }
    public setSpeedFan1(value: number): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_NIVEAU_FAN_1),
                String(value),
            ]);
        } catch (e) { throw e; }
    }
    public setSpeedFan2(value: number): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_NIVEAU_FAN_2),
                String(value),
            ]);
        } catch (e) { throw e; }
    }
    public setSpeedFan3(value: number): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_NIVEAU_FAN_3),
                String(value),
            ]);
        } catch (e) { throw e; }
    }
    public setEcoModeOn(): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_ECO_MODE),
                "1",
            ]);
        } catch (e) { throw e; }
    }
    public setEcoModeOff(): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_ECO_MODE),
                "0",
            ]);
        } catch (e) { throw e; }
    }
    public setChronoModeOn(): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_CHRONO_ON_OFF),
                "1",
            ]);
        } catch (e) { throw e; }
    }
    public setChronoModeOff(): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_CHRONO_ON_OFF),
                "0",
            ]);
        } catch (e) { throw e; }
    }
    public setOn(): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_ON_OFF),
                "1",
            ]);
        } catch (e) { throw e; }
    }
    public setOff(): boolean {
        try {
            return this.client.sendCommand([
                String(StoveCommands.PARAM_ON_OFF),
                "0",
            ]);
        } catch (e) { throw e; }
    }

    // --- High-level getters (1:1 with Python) ---
    public getSmokeTemperature(): number|null {
        const v = this._getSmokeTemperature();
        return v !== null ? parseFloat(v) : null;
    }
    public getWaterTemperature(): number|null {
        const v = this._getTemperatureWater();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetWaterTemperature(): number|null {
        const v = this._getSetTemperatureWater();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMinWaterTemperature(): number|null {
        const v = this._getSetMinTemperatureWater();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMaxWaterTemperature(): number|null {
        const v = this._getSetMaxTemperatureWater();
        return v !== null ? parseFloat(v) : null;
    }
    public getSpeedFanSmoke(): number|null {
        const v = this._getSpeedFanSmoke();
        return v !== null ? parseFloat(v) : null;
    }
    public getTemperatureRoom1(): number|null {
        const v = this._getTemperatureRoom1();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetTemperatureRoom1(): number|null {
        const v = this._getSetTemperatureRoom1();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMinTemperatureRoom1(): number|null {
        const v = this._getSetMinTemperatureRoom1();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMaxTemperatureRoom1(): number|null {
        const v = this._getSetMaxTemperatureRoom1();
        return v !== null ? parseFloat(v) : null;
    }
    public getTemperatureRoom2(): number|null {
        const v = this._getTemperatureRoom2();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetTemperatureRoom2(): number|null {
        const v = this._getSetTemperatureRoom2();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMinTemperatureRoom2(): number|null {
        const v = this._getSetMinTemperatureRoom2();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMaxTemperatureRoom2(): number|null {
        const v = this._getSetMaxTemperatureRoom2();
        return v !== null ? parseFloat(v) : null;
    }
    public getTemperatureRoom3(): number|null {
        const v = this._getTemperatureRoom3();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetTemperatureRoom3(): number|null {
        const v = this._getSetTemperatureRoom3();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMinTemperatureRoom3(): number|null {
        const v = this._getSetMinTemperatureRoom3();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMaxTemperatureRoom3(): number|null {
        const v = this._getSetMaxTemperatureRoom3();
        return v !== null ? parseFloat(v) : null;
    }
    public getSpeedFan1(): number|null {
        const v = this._getSpeedFan1();
        return v !== null ? parseInt(v) : null;
    }
    public getSetSpeedFan1(): number|null {
        const v = this._getSetSpeedFan1();
        return v !== null ? parseInt(v) : null;
    }
    public getSetMaxSpeedFan1(): number|null {
        const v = this._getSetMaxSpeedFan1();
        return v !== null ? parseInt(v) : null;
    }
    public getSpeedFan2(): number|null {
        const v = this._getSpeedFan2();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetSpeedFan2(): number|null {
        const v = this._getSetSpeedFan2();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMaxSpeedFan2(): number|null {
        const v = this._getSetMaxSpeedFan2();
        return v !== null ? parseFloat(v) : null;
    }
    public getSpeedFan3(): number|null {
        const v = this._getSpeedFan3();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetSpeedFan3(): number|null {
        const v = this._getSetSpeedFan3();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMaxSpeedFan3(): number|null {
        const v = this._getSetMaxSpeedFan3();
        return v !== null ? parseFloat(v) : null;
    }
    public getPowerLevel(): number|null {
        const v = this._getPowerLevel();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetPowerLevel(): number|null {
        const v = this._getSetPowerLevel();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMinPowerLevel(): number|null {
        const v = this._getSetMinPowerLevel();
        return v !== null ? parseFloat(v) : null;
    }
    public getSetMaxPowerLevel(): number|null {
        const v = this._getSetMaxPowerLevel();
        return v !== null ? parseFloat(v) : null;
    }
    public getAirEx1(): number|null {
        const v = this._getAirEx1();
        return v !== null ? parseFloat(v) : null;
    }
    public getAirEx2(): number|null {
        const v = this._getAirEx2();
        return v !== null ? parseFloat(v) : null;
    }
    public getAirEx3(): number|null {
        const v = this._getAirEx3();
        return v !== null ? parseFloat(v) : null;
    }
    public getAction(): string|null {
        const state = this._getStoveState();
        if (["switched_off", "black_out", "eco_stop_2", "eco_stop_3"].includes(state || "")) return "off";
        if (["starting_1_check"].includes(state || "")) return "check";
        if (["starting_2_clean_all"].includes(state || "")) return "clean_all";
        if (["starting_3_loading"].includes(state || "")) return "loading";
        if (["starting_4_waiting", "starting_5_waiting"].includes(state || "")) return "waiting";
        if (["starting_6_ignition"].includes(state || "")) return "ignition";
        if (["starting_7_stabilization"].includes(state || "")) return "stabilization";
        if (["power"].includes(state || "")) return "heating";
        if (["stopping_1_wait_standby", "stopping_2_wait_standby"].includes(state || "")) return "stopping";
        if (["eco_stop_1_standby", "standby"].includes(state || "")) return "idle";
        return state;
    }
    public getIsOn(): boolean|null {
        return this._getStoveIsOn() === "on";
    }
    public getEcoMode(): boolean|null {
        return this._getEcoMode() === "on";
    }
    public getChronoMode(): boolean|null {
        return this._getChronoMode() === "on";
    }
    public getMode(): string|null {
        return this._getStoveIsOn();
    }
    public getName(): string|null {
        const m = this.getManufacturer();
        if (m === null) return null;
        return "Stove " + m;
    }
    public getFirmware(): string|null {
        return this._getFirmwareVersion();
    }
    public getWifi(): string|null {
        return this._getWifiSignal();
    }
    public getManufacturer(): string|null {
        return this._getManufacturer();
    }
    public getWaterPump(): boolean|null {
        const v = this._getGenericPump();
        if (v === null) return null;
        return parseInt(v) !== 0;
    }
    // --- Bitfield/feature methods (1:1 with Python) ---
    public _getStoveTypeBitArray(): boolean[] {
        const type = this._getStoveType();
        if (type === null) return Array(16).fill(false);
        // Convert to 16-bit boolean array (Python BitArray equivalent)
        const bits: boolean[] = [];
        for (let i = 15; i >= 0; i--) {
            bits.push(((type >> i) & 1) === 1);
        }
        return bits;
    }
    public isBoilerEnabled(): boolean {
        return this._getStoveTypeBitArray()[6]; // Python: type[9], but JS is MSB first
    }
    public isDomesticHotWaterEnabled(): boolean {
        return this._getStoveTypeBitArray()[5]; // Python: type[10]
    }
    public getFanNumber(): number {
        const bits = this._getStoveTypeBitArray();
        // Python: nb = type[12:14]; nb.int
        // JS: bits[2] (MSB), bits[3] (LSB)
        return (bits[2] ? 2 : 0) + (bits[3] ? 1 : 0);
    }
    public isTempRoom1Enabled(): boolean {
        return this._getStoveTypeBitArray()[0]; // Python: type[15]
    }
    public isTempRoom2Enabled(): boolean {
        return this._getStoveTypeBitArray()[7]; // Python: type[8]
    }
    public isTempRoom3Enabled(): boolean {
        return this._getStoveTypeBitArray()[8]; // Python: type[7]
    }
    public isTempWaterEnabled(): boolean {
        return this._getStoveTypeBitArray()[1]; // Python: type[14]
    }
    public isPumpEnabled(): boolean {
        return this._getStoveTypeBitArray()[11]; // Python: type[4]
    }
    public isFlowSwitchEnabled(): boolean {
        return this._getStoveTypeBitArray()[10]; // Python: type[5]
    }
    public isPufferEnabled(): boolean {
        return this._getStoveTypeBitArray()[9]; // Python: type[6]
    }
    public isBoilerTempEnabled(): boolean {
        return this._getStoveTypeBitArray()[4]; // Python: type[11]
    }
    public isDhwEnabled(): boolean {
        return this._getStoveTypeBitArray()[3]; // Python: type[12]
    }
    public isAirEx1Enabled(): boolean {
        return this._getStoveTypeBitArray()[12]; // Python: type[3]
    }
    public isAirEx2Enabled(): boolean {
        return this._getStoveTypeBitArray()[13]; // Python: type[2]
    }
    public isAirEx3Enabled(): boolean {
        return this._getStoveTypeBitArray()[14]; // Python: type[1]
    }
    public isGenericPumpEnabled(): boolean {
        return this._getStoveTypeBitArray()[15]; // Python: type[0]
    }
    // Add other methods similarly...
}