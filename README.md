Maquis
===

Maquis is an ESP32 firmware for secure communications over LoRa. It's designed
to be run on something like https://heltec.org/project/wifi-lora-32/.

It runs a local webserver for communication.

Path to innawoods POC
---

- [ ] JS Client
  - [ ] Send
  - [ ] Receive
  - [ ] Config
- [ ] TCP Tunnel for ATAK
- [ ] Scrollback on OLED

Path to 1.0
---

- [ ] Clear all TODOs and verify zero known bugs
- [ ] Encryption
- [ ] Testing
- [ ] Clean up build toolchain, get away from Arduino IDE, probably onto PlatformIO?

Path to 2.0
---

- [ ] Bluetooth instead of 802.11
- [ ] Proper sleep/wake
- [ ] Interoperability with https://www.meshtastic.org/
- [ ] Durable packet delivery
