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
 [ ] convert websocket to commbloc - either disable or ignore broadcast beacons, and maybe ignore non-maquis packets?
 [ ] Message encryption
 [ ] Key handling;
  [ ] Generation for symmetric
  [ ] Export PEM
  [ ] Import PEM
 [ ] Asymmetric crypto

To Do;

 [ ] Test framework
 [ ] Message signing
 [ ] Error state handling
  [ ] Unable to decrypt
  [ ] Malformed receive
 [ ] Save last N messages in LocalStorage
 [ ] Clear messages
 [ ] Hard wipe
 [ ] Automated testing & deployment.
 [ ] Fork Webjack to support HDLC & 1200 AFSK correctly
 [ ] Diffie-Hellman for asymmetric crypto


Crypto Stream of consciousness notes;
- AES-GCM requires IV & body
- signing requires cleartext
- should ack's be encrypted?
  - yes