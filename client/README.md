maquis
===

This is a Javascript app for broadcasting and receiving encrypted messages,
either through https://github.com/publiclab/webjack, through a Websocket
connection, or through BTLE serial.

*WARNING*: It can be unlawful, depending on your local jurisdiction, to transmit
encrypted radio messages on certain frequencies. Please check your local laws before
tinkering around with this.

maquis Protocol
---

It's expected that this will be over a very lossy connection, but at the same time this is experimental, so I'm building in flexibility.

Packet Framing
---

Preamble
 - At least 2 bytes alternating 0 and 1, uncompressed, un-FEC'ed.

Version Header;
 - One nibble for version, one nibble reserved for error correction on header

Packet body
 - Error correction and format based on version.

Postambles
 - Alternating 0 and 1, undefined how many.

Packet v0
---

It's a protobuf, potentially encrypted.

TODO
---

 [ ] websocket mode to be backed by kiss-bridge, including metadata about underlying transport
 [ ] Request Ack mode
 [ ] Question, should I revisit the whole protobuf idea?
 [ ] Retransmit
 [ ] raw message mode, bypass protobufs
 [ ] Key import or generation
 [ ] Error log
  [ ] Unable to transmit
  [ ] Malformed receive
 [ ] Request ack mode
 [ ] Save last N messages
 [ ] Clear messages
 [ ] Hard wipe
 [ ] Message signing (WebCrypto + AESGCM)
 [ ] Automated testing & deployment.
 [ ] Extend Webjack to speak AX.25

