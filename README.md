# hottohts

A TypeScript/Node.js module for full-featured communication with HottoH pellet stoves over TCP/IP, ported 1:1 from the original Python library [Hottohpy](https://github.com/benlbrm/hottohpy).

---

**Status:** Production-ready | TypeScript | Node.js >= 18 | MIT License

---

## Overview

**hottohts** provides a complete, deterministic, and protocol-accurate interface for reading and controlling HottoH stoves via their WiFi module. It is a direct port of the Python library [Hottohpy](https://github.com/benlbrm/hottohpy), preserving all logic, register layouts, constants, and behaviors. The module is suitable for both automation and monitoring, and is designed for reliability and parity with the original Python implementation.

## Features
- 1:1 parity with Hottohpy: all methods, constants, and protocol logic are ported.
- Read all stove data fields (temperatures, power, fan speeds, modes, etc).
- Set target temperatures, power levels, fan speeds, eco/chrono modes, and on/off state.
- Full support for all bitfield/feature queries (e.g., isBoilerEnabled, getFanNumber, etc).
- Robust TCP communication with CRC and packet formatting matching the stove's protocol.
- Asynchronous, event-driven Node.js implementation.
- Example script included for real-time monitoring and control.

## Installation & Usage

```zsh
npm install	npm run build
npm start   # Runs the example (edit the IP address in example.ts as needed)
```

## Example

See `example.ts` for a full usage example. It prints all available data fields and demonstrates how to interact with the stove.

## API Overview

- `Hottoh` — High-level API for stove control and monitoring
- `HottohRemoteClient` — Low-level TCP client
- `Request` — Protocol packet builder
- `const.ts` — All enums, constants, and register definitions

## Project Structure
- `client.ts` — TCP client, protocol, and data polling logic
- `const.ts` — All enums, constants, and register definitions
- `hottoht.ts` — High-level API: all getters, setters, and feature methods
- `request.ts` — Request/packet formatting and CRC logic
- `example.ts` — Example usage script
- `index.ts` — Module entry point

## Credits
- Ported from [Hottohpy](https://github.com/benlbrm/hottohpy) by [benlbrm](https://github.com/benlbrm).
- TypeScript port mostly by AI and Hvid

## License
MIT
