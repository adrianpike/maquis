The server components for a Maquis Pi.

Base Host - ideally this could be done with either Balena -or- burning our own image. Balena would be better for auto-updates.
- Docker install
- hostapd
- Status daemon (probably based off bosunbox's go daemon?)

Containers, should autoupdate;
- nginx for status and hosting the client
- commbloc
- direwolf

TODO: subscribe in-container to outside of container takchat messages on 224.10.10.1
