const protobuf = require('protobufjs');

// TODO: extract this into a .proto file
var MaquisMessage = new protobuf.Type("MaquisMessage");
MaquisMessage.add(new protobuf.Field("body", 1, "string"));
MaquisMessage.add(new protobuf.Field("sid", 2, "string"));
MaquisMessage.add(new protobuf.Field("ts", 3, "double"));
MaquisMessage.add(new protobuf.Field("sig", 4, "string"));
MaquisMessage.add(new protobuf.Field("requestAck", 5, "bool"));

var AckProto = new protbuf.Type('MaquisAck');
AckProto.add(new protobuf.Field('sig', 1, 'string'));
AckProto.add(new protobuf.Field('acker_id', 2, 'string'));
AckProto.add(new protobuf.Field("ts", 3, "double"));

var MaquisProto = new protobuf.types("MaquisProto");
MaquisProto.add(new protobuf.Field("message", 1, "oneof"));

class MaquisPacket {
  static encode(message) {
    let version = '\x00';

    var buf = MaquisProto.create(message);
    let protoBufArr = MaquisProto.encode(buf).finish();
    
    let packetBuf = new Uint8Array(protoBufArr.byteLength + 1);
    packetBuf[0] = 0x00;
    packetBuf.set(protoBufArr, 1);

    return packetBuf;
  }

  static decode(packet) {
    let packetBuf = new Uint8Array(packet);
    if (packetBuf[0] == 0x00) {
      var decodedMessage = MaquisProto.decode(packetBuf.slice(1));
      return decodedMessage;
    } else {
      console.error('Unknown packet version: ', packetBuf[0]);
      throw new Error('Unknown packet version', packetBuf[0]);
    }
    
  }
}

module.exports = MaquisPacket;
