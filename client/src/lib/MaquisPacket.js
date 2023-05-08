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

class MaquisPacket {
  static encode(message) {
    let versionAndType = 0x00;

    var msg = MaquisMessage.create(message);
    let protoBufArr = MaquisMessage.encode(msg).finish();
    
    let packetBuf = new Uint8Array(protoBufArr.byteLength + 1);
    packetBuf[0] = versionAndType;
    packetBuf.set(protoBufArr, 1);

    return packetBuf;
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


  static decode(packet) {
    let packetBuf = new Uint8Array(packet);
    if (packetBuf[0] == 0x00) {
      return MaquisMessage.decode(packetBuf.slice(1));
    } else if (packetBuf[0] == 0x01) {
      return AckProto.decode(packetBuf.slice(1));
    } else {
      console.error('Unknown message type: ', packetBuf[0]);
      throw new Error('Unknown message type', packetBuf[0]);
    }
  }
}

module.exports = MaquisPacket;
