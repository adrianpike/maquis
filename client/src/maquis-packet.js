const protobuf = require('protobufjs');

var MaquisMessage = new protobuf.Type("MaquisMessage");
MaquisMessage.add(new protobuf.Field("body", 1, "string"));
MaquisMessage.add(new protobuf.Field("sid", 2, "string"));
MaquisMessage.add(new protobuf.Field("ts", 3, "double"));
MaquisMessage.add(new protobuf.Field("sig", 4, "string"));
MaquisMessage.add(new protobuf.Field("requestAck", 5, "bool"));

var AckProto = new protobuf.Type('MaquisAck');
AckProto.add(new protobuf.Field('msgHash', 1, 'string'));
AckProto.add(new protobuf.Field('ackerId', 2, 'string'));
AckProto.add(new protobuf.Field("ts", 3, "double"));

var GcmMessage = new protobuf.Type("MaquisGCMMessage");
GcmMessage.add(new protobuf.Field("ciphertext", 1, "bytes"));
GcmMessage.add(new protobuf.Field("iv", 2, "bytes"));

class MaquisPacket {
  static async encode(message, options) {
    let versionAndType = 0x00;

    var msg = MaquisMessage.create(message);
    let protoBufArr = MaquisMessage.encode(msg).finish();

    let packetBuf = new Uint8Array(protoBufArr.byteLength + 1);
    packetBuf[0] = versionAndType;
    packetBuf.set(protoBufArr, 1);
    
    if (options.cryptoMode != 'none') {
      let b64 = atob(options.symmetricKey);
      const buf = new ArrayBuffer(b64.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = b64.length; i < strLen; i++) {
        bufView[i] = b64.charCodeAt(i);
      }  
      
      let key = await window.crypto.subtle.importKey(
        "raw",
        bufView,
        "AES-GCM",
        true,
        ["encrypt"]
      );
    
      let iv = window.crypto.getRandomValues(new Uint8Array(12));
      let value = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        packetBuf
      );

      let encryptedProtoBufArr = GcmMessage.encode({
        ciphertext: new Uint8Array(value),
        iv: iv
      }).finish();
      let encryptedPacketBuf = new Uint8Array(encryptedProtoBufArr.byteLength + 1);
      encryptedPacketBuf[0] = 0x02;
      encryptedPacketBuf.set(encryptedProtoBufArr, 1);

      return encryptedPacketBuf;
    } else {
      return packetBuf;
    }
  }

  static encodeAck(message) {
    let version = 0x01; // TODO: make this a nibble, first nibble is version, second is message type

    var msg = AckProto.create(message);
    let protoBufArr = AckProto.encode(msg).finish();
    
    let packetBuf = new Uint8Array(protoBufArr.byteLength + 1);
    packetBuf[0] = 0x01;
    packetBuf.set(protoBufArr, 1);

    return packetBuf;
  }

  static async decode(packet, options) {
    let packetBuf = new Uint8Array(packet);
    if (packetBuf[0] == 0x00) {
      return MaquisMessage.decode(packetBuf.slice(1));
    } else if (packetBuf[0] == 0x01) {
      return AckProto.decode(packetBuf.slice(1));
    } else if (packetBuf[0] == 0x02) {
      // It's a wrapped symmetric crypto packet - the inner one can be either an ack or a message, so we'll decrypt & then re-decode
      var protobufPacket = GcmMessage.decode(packetBuf.slice(1));

      let b64 = atob(options.symmetricKey);
      const buf = new ArrayBuffer(b64.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = b64.length; i < strLen; i++) {
        bufView[i] = b64.charCodeAt(i);
      }
      
      let key = await window.crypto.subtle.importKey(
        "raw",
        bufView,
        "AES-GCM",
        true,
        ["decrypt"]
      );

      try {
        let value = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: protobufPacket.iv },
          key,
          protobufPacket.ciphertext
        );
        return this.decode(value, options);
      } catch(e) {
        throw new Error('Received encrypted message we cannot decrypt', e);
      }
    } else {
      console.error('Unknown message type: ', packetBuf[0]);
      // throw new Error('Unknown message type, ignoring', packetBuf[0]);
    }
  }
}

module.exports = MaquisPacket;
