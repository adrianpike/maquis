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

Doing;
 [ ] Message encryption
 [ ] Key handling;
  [ ] Generation
  [ ] Export PEM
  [ ] Import PEM

To Do;

 [ ] Offline mode
 [ ] Test framework
 [ ] websocket mode when coming from commbloc includes metadata about underlying transport
 [ ] Request Ack setting
 [ ] Retransmit
 [ ] Message signing
 [ ] Error state handling
  [ ] Unable to decrypt
  [ ] Malformed receive
 [ ] Save last N messages in LocalStorage
 [ ] Clear messages
 [ ] Hard wipe
 [ ] Automated testing & deployment.
 [ ] Fork Webjack to support HDLC & 1200 AFSK correctly
 [ ] Fancier Key Handling
  [ ] QR Export
  [ ] QR Import
 [ ] Diffie-Hellman for asymmetric crypto
