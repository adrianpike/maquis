The server components for a maquis host.

Base Host - ideally this could be done with either Balena -or- a base Pi burn
- Docker install
- Status daemon (probably based off bosunbox's go daemon?)

Containers;
- hostapd (ideally, we might have to move this to the host)
- nginx for status, websocket, control
- kiss-bridge
- direwolf
- meshtastic

