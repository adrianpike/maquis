maquis
===

This is a Javascript app for broadcasting and receiving encrypted messages,
either through https://github.com/publiclab/webjack, through a Websocket
connection.

*WARNING*: It can be unlawful, depending on your local jurisdiction, to transmit
encrypted radio messages on certain frequencies. Please check your local laws before
tinkering around with this.

TODO
---

Doing;
 [ ] Rewrite the audio transmit/receive setup
 [ ] Refactor the whole thing.
  [X] Extract all the backend into some classes.
  [ ] Promisify a lot of the async style.
  [ ] Rewrite the frontend to be more modular and actually design it.
 [ ] Message encryption
  [X] Symmetric w/AES
 [ ] Key handling;
  [ ] Generation
  [ ] Export PEM
  [ ] Import PEM

To Do;
 [ ] Test framework
 [ ] Tighter integration with commbloc as a websocket backend
 [ ] Request Ack setting
 [ ] Retransmit
 [ ] Crypto Modes
  [ ] Sign
  [ ] Encrypt for Target
 [ ] Error state handling
  [ ] Unable to decrypt
  [ ] Malformed receive
 [ ] Save last N messages in LocalStorage
 [ ] Offline mode
 [ ] Clear messages
 [ ] Hard wipe
 [ ] Automated testing & deployment.
 [ ] Rewrite Webjack
 [ ] Fancier Key Handling
  [ ] QR Export
  [ ] QR Import


Crypto Modes
---

Symmetric with Bidirectional keyloading
 - Easiest and lowest effort basic crypto.
 - Why bidirectional? If a clever threat actor grabs a device, they'll exfil the key anyway.
   Symmetric is fairly useless, but it at least works.

Asymmetric with preshared PKI
