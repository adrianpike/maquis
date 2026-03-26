# Maquis — AI Assistant Guide

Maquis is a resilient communication tool for encrypted message broadcasting and receiving in challenging or hostile environments. It supports multiple transport channels: acoustic (AFSK via WebJack), WebSocket (via a local commbloc bridge), and LoRa (ESP32 firmware, WIP).

---

## Repository Structure

```
maquis/
├── client/          # Preact frontend (primary codebase)
│   ├── src/
│   │   ├── index.js             # App root component and state management
│   │   ├── maquis-packet.js     # Packet encoding/decoding (protobuf + crypto)
│   │   ├── maquis.proto         # Protocol Buffer schema
│   │   ├── channels/
│   │   │   ├── acoustic.js      # WebJack AFSK modem channel
│   │   │   └── websocket.js     # WebSocket channel
│   │   ├── components/
│   │   │   ├── MaquisConfig.js  # Settings panel (crypto keys, config)
│   │   │   ├── MessageComposer.js
│   │   │   ├── MessageLog.js
│   │   │   ├── ModeConfig.js    # Transport mode selector
│   │   │   └── ChannelStatus.js
│   │   └── utils/
│   │       └── crypto.js        # Random session ID generation
│   ├── webpack.config.js
│   └── package.json
├── server/          # Raspberry Pi infrastructure (Docker-based)
│   ├── docker-compose.yml       # nginx + direwolf + kiss-bridge
│   ├── pi-os.json               # Packer image definition
│   ├── direwolf/                # AFSK modem container
│   ├── nginx/                   # Static file server + reverse proxy
│   └── hostapd/                 # WiFi AP configuration
└── esp32/           # ESP32/LoRa Arduino firmware (WIP)
    └── maquis.ino
```

---

## Development Workflows

### Client (primary development target)

```bash
cd client
npm install          # install dependencies
npm run dev          # webpack-dev-server on :4200 (hot reload)
npm run build        # production build to client/build/
```

- Dev server binds to `0.0.0.0:4200` with `allowedHosts: "all"` (WSL2 compatible).
- Hot reload is intentionally disabled in webpack config.
- Build output goes to `client/build/` (gitignored).

### Testing

No test framework is currently configured. `npm test` returns an error. Testing is a known gap and a TODO item.

### Server Deployment

```bash
# Build a Raspberry Pi OS image (requires Packer + QEMU ARM)
cd server
packer build pi-os.json

# Run services locally with Docker Compose
docker-compose up -d
```

Services:
- **nginx** — serves the built client app and proxies WebSocket traffic
- **direwolf** — AFSK modem (audio ↔ AX.25 packet radio)
- **kiss-bridge (commbloc)** — bridges WebSocket clients to KISS/TNC interface

### ESP32 Firmware

Use Arduino IDE or PlatformIO to compile `esp32/maquis.ino`. The `secrets.h` file (gitignored) contains WiFi credentials and encryption keys — never commit it.

---

## Architecture and Key Conventions

### Framework

- **Preact 10** (not React) — the webpack config aliases `react` → `preact/compat`.
- **@ionic/react** for UI components.
- **Babel** handles JSX with the Preact pragma (`h`).

Components use **class-based syntax** with `render(props, state)`:

```javascript
import { Component, h } from 'preact';

class MyComponent extends Component {
  render(props, state) {
    return <div>{state.value}</div>;
  }
}
```

Do not introduce functional components or React hooks — keep consistency with the existing style.

### Message Protocol

Packets have a version byte in the first octet followed by a Protocol Buffer payload:

| Version | Meaning |
|---------|---------|
| `0x00`  | Plaintext message |
| `0x01`  | ACK packet |
| `0x02`  | AES-GCM encrypted packet (contains inner encrypted message) |

Encrypted packets recursively contain an inner message: decrypt the outer packet to reveal the protobuf-encoded inner `MaquisMessage`.

### Configuration

- `DEFAULT_CONFIG` in `index.js` defines all settings.
- Config is persisted to `localStorage` under the key `'config'`.
- On load, persisted config is merged with defaults (persisted values win).
- Encryption defaults to `cryptoMode: 'none'`; AES-GCM is the only other supported mode.

### Channel Abstraction

Each channel exposes:
- `connect(onMessage)` — establishes connection and registers message callback
- `transmit(data)` — sends binary data

The active channel is stored in `this.channel` on the root component. Only one channel is active at a time.

### Cryptography

- Uses **Web Crypto API** (`window.crypto.subtle`) — browser-native, no external crypto library for AES-GCM.
- `@aws-crypto/sha256-browser` is used for SHA-256 hashing.
- AES-GCM with a 256-bit key and a random 12-byte IV per message.
- Keys are stored as base64-encoded strings in config.
- `RandomPrintableString()` in `crypto.js` generates random session IDs from a 64-char alphabet.
- Never log or expose raw key material.

---

## Known Issues and Active TODOs

These are noted in READMEs and inline comments — be aware of them when making changes:

- **BUG**: Error callback in WebSocket mode is ignored (`index.js` near line 90 — "don't ignore this, tis silly").
- **BUG**: `ChannelStatus` error state not properly surfaced after failed connection.
- **TODO**: Asymmetric crypto (RSA/Diffie-Hellman), message signing.
- **TODO**: Comprehensive error states for decrypt failures and malformed packets.
- **TODO**: Multi-message localStorage persistence (currently only last message retained).
- **TODO**: Key import/export UI (PEM format).
- **TODO**: AX.25 framing support.
- **TODO**: CI/CD for automated Raspberry Pi image builds.
- **TODO**: ESP32/LoRa firmware completion (marked WIP).
- **TODO**: Test framework setup.

---

## Files to Never Modify or Commit

- `esp32/secrets.h` — gitignored, contains WiFi credentials and keys
- `client/build/` — gitignored build output
- `client/node_modules/` — gitignored dependencies

---

## Gotchas

- Webpack polls for file changes (`watchOptions.poll: 1000`) — this is intentional for WSL2 compatibility, do not remove it.
- React is aliased to Preact in webpack — do not add real React as a dependency.
- The `babel.config.json` sets JSX pragma to `h` from Preact — JSX files must import `h` or use the pragma comment.
- `protobufjs` is used at runtime for protobuf encoding; the `.proto` file is loaded dynamically, not compiled.
- The dev server allows all hosts — this is intentional for LAN access during field testing.
