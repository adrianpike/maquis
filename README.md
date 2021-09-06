Maquis
===

Maquis is a project for enabling resilient communication, even in the presence
of signifigant adversaries.

The client is a Javascript app that runs on end users' smartphones, and can send
messages to each other. Messages can be transmitted directly via AFSK, or they
can leverage a Websocket backend for expanded transport options.

The reference backend is [commbloc](https://github.com/adrianpike/kiss-bridge),
which can be configured with any number of TNC, [meshtastic](https://meshtastic.org/) and IP links.
It broadcasts messages in a best-effort fashion, and is able to achieve impressive
results in mixed radio conditions in my limited field testing.

[ INSERT DEMO VIDEO HERE ]

Quickstart
---

 - Grab your nearest Raspberry Pi.
 - Burn one of the release images onto it.
 - Connect an audio interface & radio if you'd like to use Direwolf.
 - Connect a Meshtastic device if you'd like to use Meshtastic.
 - Connect to the AP named `Maquis-XXXX`, navigate to `maquis.internal`, have fun!

Directory Structure
---

 - `/client` - The JS client itself.
 - `/server` - The server containers and tooling to burn an image for a Pi.
 - `/esp32` - Firmware to run a server component on an ESP32 - this is a major WIP.

Path to 1.0
---

- [ ] Github Actions-based CI for ready-made Pi images.

Future Ideas
---

- [ ] Tighter interop with companion projects;
   - disaster.radio
   - Meshtastic
   - ATAK, maybe we can send/receive CoT's directly?
- [ ] Client can directly leverage a TNC such as a mobilind. This is a blocker at the moment due to Web Bluetooth API limitations on Android.
