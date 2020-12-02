maquis Client
===

This is a Javascript app for broadcasting and receiving encrypted messages,
either through https://github.com/publiclab/webjack, through a Websocket
connection, or through BTLE serial.

maquis Protocol
---

It's expected that this will be over a very lossy connection, but at the same time this is experimental, so I'm building in flexibility.

Packet Format
---

Preamble
 - 2 bytes alternating 0 and 1, uncompressed, un-FEC'ed.

Version Header;
 - One nibble for version, one nibble reserved for error correction on header

Packet body
 - Error correction and format based on version. For version 0x0, it's just raw bytes.

Postamble
 - 1 byte alternating 0 and 1

TODO
---

 [+] Basic send/receive for v0
 [+] webjack mode
 [ ] websocket mode
 [ ] KISS mode
 [ ] TCP/UDP mode (direwolf is port 8001, FWIW :) )
 [ ] BTLE mode
 [ ] Protobuf
 [ ] Key import or generation
 [ ] Message signing (WebCrypto + AESGCM)
