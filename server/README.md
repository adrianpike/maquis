The server components for a maquis host.

Base Host - ideally this could be done with either Balena -or- a base Pi burn
- Docker install
- hostapd
- Status daemon (probably based off bosunbox's go daemon?)

Containers;
- nginx for status and hosting the build
- kiss-bridge
- direwolf

