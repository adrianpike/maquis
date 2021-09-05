maquis
===

This is a Javascript app for broadcasting and receiving encrypted messages,
either through https://github.com/publiclab/webjack, through a Websocket
connection, or through BTLE serial.

*WARNING*: It can be unlawful, depending on your local jurisdiction, to transmit
encrypted radio messages on certain frequencies. Please check your local laws before
tinkering around with this.

TODO
---

 [ ] Test framework
 [ ] Refactor the whole preact setup
 [ ] websocket mode includes metadata about underlying transport
 [ ] Request Ack setting
 [ ] Retransmit
 [ ] Message signing
 [ ] Message encryption
 [ ] raw message mode to bypass protobuf overhead
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

