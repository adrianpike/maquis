import {Sha256} from '@aws-crypto/sha256-js';

const MaquisPacket = require('./MaquisPacket');
const Acoustic = require('../channels/acoustic.js');
const Websocket = require('../channels/websocket.js');

export class MaquisNode {
  constructor() {
  }

  applyConfig(config) {
    this.config = config;

    switch(this.config['mode']) {
      case 'Websocket':
        this.channel = new Websocket(this.config.modeConfig);;
        break;
      case 'Acoustic':
        this.channel = new Acoustic(this.config.modeConfig);
        break;
    };

    if (this.config.symmetricKey && this.config.cryptoMode != 'none') {
      console.log('Importing crypto key');
      let b64 = atob(this.config.symmetricKey);
      const buf = new ArrayBuffer(b64.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = b64.length; i < strLen; i++) {
        bufView[i] = b64.charCodeAt(i);
      }    

      window.crypto.subtle.importKey(
        "raw",
        bufView,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]).then((key) => {
        this.key = key;
      });
    }

    // At this point, this.onMessage is the onMessage from the Component.
    // We need a more clever way to wrap this, but this'll work for now.
    this.channel.onMessage = this.onPacket.bind(this);

    if (this.config['mode'] === 'Websocket') {
      this.channel.connect(this.onConnect);
    }
  }

  onPacket(rawPacket) {
    console.log(rawPacket);
    let packet;
    // If we're in a crypto mode, we must decode
    if (this.config['cryptoMode'] == 'aes') {
      console.log('attempting decrypt');
      let iv = window.crypto.getRandomValues(new Uint8Array(12));
      window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        this.key,
        rawPacket 
      ).then((decrypted) => {
        console.log(decrypted);

        packet = MaquisPacket.decode(decrypted);

        console.log(packet);
 
      }).catch((err) => {
        console.log('Decryption error', err);
      });

      return;
    } else {
      packet = MaquisPacket.decode(rawPacket);
    }

    // TODO: messages should be able to get a number of reflections
    // ... or do we rely on commbloc or the downstream?
    // ... probably, because we should probably wrap and include
    // ... more metadata since we might want to retransmit even
    // ... if we can't decrypt?

    // ack if needed
    if (packet.requestAck && packet.requestAck == true) {
      // TODO: when there's encryption, should i only ack things i can decrypt?
      // Either way, we're just acking a hash, so we don't have to
      let hash = new Sha256();
      hash.update(rawPacket);

      hash.digest().then((digest) => {
        let ackPacket = {
          msgHash: new TextDecoder().decode(digest),
          ackerId: this.config.sid, // This is a potential leak vector
          ts: new Date().getTime(),
        }
        const encodedPacket = MaquisPacket.encodeAck(ackPacket);
        this.channel.transmit(encodedPacket);
      });
    }

    // this is an ack packet
    if (packet.ackerId) {
      this.onMessageAck(packet.msgHash);
    } else {
      // This is an incoming message
      let message = Object.assign({}, packet);
      message.acked = false;
      message.direction = 'incoming'; // Don't like this, maybe an enum?
      this.onMessage(message);
    }

  }

  sendMessage(messageBody, cb) {
    let packet = {
      body: messageBody,
      sid: this.config.sid, // This is not encrypted, potentially should be?
      // TODO: integrate with sneakerdrpo
      ts: new Date().getTime(),
      sig: '', // TODO
      requestAck: true, // TODO
      type: 'message' // can also be [ack,coords]
    }
    const encodedPacket = MaquisPacket.encode(packet);
    // THINK: should this be also wrapped somehow? Should encrypted packets get acked?
    if (1==1 || this.config.cryptoMode == 'aes') { // DEBUGGIN
      let iv = window.crypto.getRandomValues(new Uint8Array(12));
      window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        this.key,
        encodedPacket 
      ).then((encrypted) => {
        console.log(encrypted);
        this.channel.transmit(encrypted);

        let message = Object.assign({}, packet);
        message.acked = false;
        message.direction = 'outgoing'; // Don't like this
        let hash = new Sha256();
        hash.update(encodedPacket);
        hash.digest().then((digest) => {
          message.digest = new TextDecoder().decode(digest),
          cb(message);
        });
      });
    } else { // FIXME 
      this.channel.transmit(encodedPacket);

      let message = Object.assign({}, packet);
      message.acked = false;
      message.direction = 'outgoing'; // Don't like this
      let hash = new Sha256();
      hash.update(encodedPacket);
      hash.digest().then((digest) => {
        message.digest = new TextDecoder().decode(digest),
        cb(message);
      });
    }
  }

}
