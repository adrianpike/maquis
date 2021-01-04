const protobuf = require('protobufjs');

// TODO: extract this into a .proto file
var MaquisProto = new protobuf.Type("MaquisProto");
MaquisProto.add(new protobuf.Field("body", 1, "string"));
MaquisProto.add(new protobuf.Field("sid", 2, "string"));
MaquisProto.add(new protobuf.Field("sig", 3, "string"));

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
    }
    
  }
}

module.exports = MaquisPacket;
