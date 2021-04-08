The server components for a Maquis Pi.

Base Host - ideally this could be done with either Balena -or- a base Pi burn
- Docker install
- hostapd
- Status daemon (probably based off bosunbox's go daemon?)

Containers;
- nginx for status and hosting the build
- kiss-bridge
- direwolf

TODO: subscribe in-container to outside of container takchat messages on 224.10.10.1
