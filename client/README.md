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
 [ ] Show an indicator if a message was encrypted or not
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
 [ ] Rewrite Acoustic mode to speak correct AX.25 / Bell 202 or Bell 103 for lower quality links
 [ ] Diffie-Hellman for asymmetric crypto