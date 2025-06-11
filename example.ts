/**
 * Example usage for hottohts: prints all available stove data fields.
 *
 * Edit the IP address below to match your stove's WiFi module.
 * Run with: npm start
 */
import { Hottoh } from './hottoht';

const stove = new Hottoh('192.168.1.158', 5001, 0);
stove.connect();

setInterval(() => {
    console.log("#### Start Stove Data's ####");
    function printWithIndices(label: string, data: any[] | null) {
        if (!data) {
            console.log(`${label}: [data not available]`);
            return;
        }
        console.log(`${label}:`);
        data.forEach((value, idx) => {
            console.log(`  [${idx}] ${value}`);
        });
    }
    printWithIndices('Info', stove.client['_info']);
    printWithIndices('Data', stove.client['_data']);
    printWithIndices('Data2', stove.client['_data2']);
    console.log(`_getFirmwareVersion [Info[1], INDEX_FIRMWARE_VERSION]: ${stove._getFirmwareVersion()}`);
    console.log(`_getWifiSignal [Info[2], INDEX_WIFI_SIGNAL]: ${stove._getWifiSignal()}`);
    console.log(`_getPageIndex [Data[0], INDEX_PAGE_INDEX]: ${stove._getPageIndex()}`);
    console.log(`_getManufacturer [Info[0], INDEX_MANUFACTURER]: ${stove._getManufacturer()}`);
    console.log(`_getIsBitmapVisible [Data[2], INDEX_IS_BITMAP_VISIBLE]: ${stove._getIsBitmapVisible()}`);
    console.log(`_getIsValid [Data[3], INDEX_IS_VALID]: ${stove._getIsValid()}`);
    console.log(`_getStoveType [Data[4], INDEX_STOVE_TYPE]: ${stove._getStoveType()}`);
    console.log(`_getStoveState [Data[5], INDEX_STOVE_STATE]: ${stove._getStoveState()}`);
    console.log(`_getStoveIsOn [Data[6], INDEX_STOVE_IS_ON]: ${stove._getStoveIsOn()}`);
    console.log(`_getEcoMode [Data[7], INDEX_ECO_MODE]: ${stove._getEcoMode()}`);
    console.log(`_getChronoMode [Data[8], INDEX_CHRONO_MODE]: ${stove._getChronoMode()}`);
    console.log(`_getTemperatureRoom1 [Data[9], INDEX_TEMPERATURE_ROOM1]: ${stove._getTemperatureRoom1()}`);
    console.log(`_getSetTemperatureRoom1 [Data[10], INDEX_SET_TEMPERATURE_ROOM1]: ${stove._getSetTemperatureRoom1()}`);
    console.log(`_getSetMaxTemperatureRoom1 [Data[11], INDEX_SET_MAX_TEMPERATURE_ROOM1]: ${stove._getSetMaxTemperatureRoom1()}`);
    console.log(`_getSetMinTemperatureRoom1 [Data[12], INDEX_SET_MIN_TEMPERATURE_ROOM1]: ${stove._getSetMinTemperatureRoom1()}`);
    console.log(`_getTemperatureRoom2 [Data[13], INDEX_TEMPERATURE_ROOM2]: ${stove._getTemperatureRoom2()}`);
    console.log(`_getSetTemperatureRoom2 [Data[14], INDEX_SET_TEMPERATURE_ROOM2]: ${stove._getSetTemperatureRoom2()}`);
    console.log(`_getSetMaxTemperatureRoom2 [Data[15], INDEX_SET_MAX_TEMPERATURE_ROOM2]: ${stove._getSetMaxTemperatureRoom2()}`);
    console.log(`_getSetMinTemperatureRoom2 [Data[16], INDEX_SET_MIN_TEMPERATURE_ROOM2]: ${stove._getSetMinTemperatureRoom2()}`);
    console.log(`_getTemperatureRoom3 [Data2[17], INDEX_TEMPERATURE_ROOM3]: ${stove._getTemperatureRoom3()}`);
    console.log(`_getSetTemperatureRoom3 [Data2[18], INDEX_SET_TEMPERATURE_ROOM3]: ${stove._getSetTemperatureRoom3()}`);
    console.log(`_getSetMaxTemperatureRoom3 [Data2[19], INDEX_SET_MAX_TEMPERATURE_ROOM3]: ${stove._getSetMaxTemperatureRoom3()}`);
    console.log(`_getSetMinTemperatureRoom3 [Data2[20], INDEX_SET_MIN_TEMPERATURE_ROOM3]: ${stove._getSetMinTemperatureRoom3()}`);
    console.log(`_getTemperatureWater [Data[17], INDEX_TEMPERATURE_WATER]: ${stove._getTemperatureWater()}`);
    console.log(`_getSetTemperatureWater [Data[18], INDEX_SET_TEMPERATURE_WATER]: ${stove._getSetTemperatureWater()}`);
    console.log(`_getSetMaxTemperatureWater [Data[20], INDEX_SET_MAX_TEMPERATURE_WATER]: ${stove._getSetMaxTemperatureWater()}`);
    console.log(`_getSetMinTemperatureWater [Data[19], INDEX_SET_MIN_TEMPERATURE_WATER]: ${stove._getSetMinTemperatureWater()}`);
    console.log(`_getSmokeTemperature [Data[21], INDEX_SMOKE_TEMPERATURE]: ${stove._getSmokeTemperature()}`);
    console.log(`_getPowerLevel [Data[22], INDEX_POWER_LEVEL]: ${stove._getPowerLevel()}`);
    console.log(`_getSetPowerLevel [Data[23], INDEX_SET_POWER_LEVEL]: ${stove._getSetPowerLevel()}`);
    console.log(`_getSetMaxPowerLevel [Data[25], INDEX_SET_MAX_POWER_LEVEL]: ${stove._getSetMaxPowerLevel()}`);
    console.log(`_getSetMinPowerLevel [Data[24], INDEX_SET_MIN_POWER_LEVEL]: ${stove._getSetMinPowerLevel()}`);
    console.log(`_getSpeedFanSmoke [Data[26], INDEX_SPEED_FAN_SMOKE]: ${stove._getSpeedFanSmoke()}`);
    console.log(`_getSpeedFan1 [Data[27], INDEX_SPEED_FAN1]: ${stove._getSpeedFan1()}`);
    console.log(`_getSetSpeedFan1 [Data[28], INDEX_SET_SPEED_FAN1]: ${stove._getSetSpeedFan1()}`);
    console.log(`_getSetMaxSpeedFan1 [Data[29], INDEX_SET_MAX_SPEED_FAN1]: ${stove._getSetMaxSpeedFan1()}`);
    console.log(`_getSpeedFan2 [Data[30], INDEX_SPEED_FAN2]: ${stove._getSpeedFan2()}`);
    console.log(`_getSetSpeedFan2 [Data[31], INDEX_SET_SPEED_FAN2]: ${stove._getSetSpeedFan2()}`);
    console.log(`_getSetMaxSpeedFan2 [Data[32], INDEX_SET_MAX_SPEED_FAN2]: ${stove._getSetMaxSpeedFan2()}`);
    console.log(`_getSpeedFan3 [Data[33], INDEX_SPEED_FAN3]: ${stove._getSpeedFan3()}`);
    console.log(`_getSetSpeedFan3 [Data[34], INDEX_SET_SPEED_FAN3]: ${stove._getSetSpeedFan3()}`);
    console.log(`_getSetMaxSpeedFan3 [Data[35], INDEX_SET_MAX_SPEED_FAN3]: ${stove._getSetMaxSpeedFan3()}`);
    console.log(`_getFlowSwitch [Data2[1], INDEX_FLOW_SWITCH]: ${stove._getFlowSwitch()}`);
    console.log(`_getGenericPump [Data2[2], INDEX_GENERIC_PUMP]: ${stove._getGenericPump()}`);
    console.log(`_getAirEx1 [Data2[3], INDEX_AIR_EX1]: ${stove._getAirEx1()}`);
    console.log(`_getAirEx2 [Data2[4], INDEX_AIR_EX2]: ${stove._getAirEx2()}`);
    console.log(`_getAirEx3 [Data2[5], INDEX_AIR_EX3]: ${stove._getAirEx3()}`);
    console.log(`_getPuffer [Data2[6], INDEX_PUFFER]: ${stove._getPuffer()}`);
    console.log(`_getSetPuffer [Data2[7], INDEX_SET_PUFFER]: ${stove._getSetPuffer()}`);
    console.log(`_getSetMinPuffer [Data2[8], INDEX_SET_MIN_PUFFER]: ${stove._getSetMinPuffer()}`);
    console.log(`_getSetMaxPuffer [Data2[9], INDEX_SET_MAX_PUFFER]: ${stove._getSetMaxPuffer()}`);
    console.log(`_getBoiler [Data2[10], INDEX_BOILER]: ${stove._getBoiler()}`);
    console.log(`_getSetBoiler [Data2[11], INDEX_SET_BOILER]: ${stove._getSetBoiler()}`);
    console.log(`_getSetMinBoiler [Data2[12], INDEX_SET_MIN_BOILER]: ${stove._getSetMinBoiler()}`);
    console.log(`_getSetMaxBoiler [Data2[13], INDEX_SET_MAX_BOILER]: ${stove._getSetMaxBoiler()}`);
    console.log(`_getDhw [Data2[14], INDEX_DHW]: ${stove._getDhw()}`);
    console.log(`_getSetDhw [Data2[15], INDEX_SET_DHW]: ${stove._getSetDhw()}`);
    console.log(`_getSetMinDhw [Data2[16], INDEX_SET_MIN_DHW]: ${stove._getSetMinDhw()}`);
    console.log(`_getSetMaxDhw [Data2[17], INDEX_SET_MAX_DHW]: ${stove._getSetMaxDhw()}`);
    console.log("#### End Stove Data's ####");
}, 2000);