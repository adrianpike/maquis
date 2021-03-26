Maquis
===

Maquis is a project for enabling resilient communication, even in the presence
of signifigant adversaries.

There's two major components, a web client for control and communication, and a
server component that would run on something like a Raspberry PI. The web client
can stand alone, but the server will enhance the communication methods available.

Communication Methods
---

Inputs include;
 - UDP
 - Websocket from the browser client

Outputs include;
 - Meshtastic
 - TNC, either using Direwolf or mobilinkd
 - Ethernet / WiFi bridging
 - Browser-based AFSK
   - TODO: X.25 Framing on the browser

Directory Structure
---

/client - The JS client itself.
/esp32 - Firmware to run a server component on an ESP32
/server - The server containers and tooling to burn an image for a Pi.

Path to 1.0
---

- [ ] Mapping tool
- [ ] TCP Tunnel for ATAK
- [ ] Clear all client & server TODOs and verify zero known bugs
- [ ] Encryption
- [ ] Github Actions-based CI for ready-made images.

Path to 2.0
---

- [ ] Tighter interop with disaster.radio and Meshtastic
- [ ] Stronger delivery guarantees
- [ ] Basic routing across output modes.
