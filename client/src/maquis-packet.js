class MaquisPacket {
  static encode(message) {
    let preambleByte = '¬' // 170 dec, 10101010
    let header = '\0\0';

    // todo: Uint8Array should be what we're actually gonna stream out

    return preambleByte + preambleByte + message;
  }
}

module.exports = MaquisPacket;
