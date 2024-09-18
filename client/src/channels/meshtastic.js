import { HttpConnection, BleConnection, SerialConnection } from "@meshtastic/js";
const MaquisPacket = require('../maquis-packet.js');


class Meshtastic {

    constructor(config) {
      this.config = config;
      switch(config.connectionType) {
        case 'BLE':
        this.device = new BleConnection();
        break;
        default: 
        this.device = new SerialConnection();
      }
    }

    async connect(cb) {
      let port, connection;
      switch(this.config.connectionType) {
        case 'BLE':
          port = await this.device.getDevices();
          connection = await this.device.connect({ device: port }); 
        break;
        default:
          port = await this.device.getPort();
          connection = await this.device.connect({ port: port });
      }  

      this.device.events.onMeshPacket.subscribe(async (pkt) => {
        console.debug('Incoming packet', pkt);
        switch(pkt.payloadVariant.value.portnum) {
          case 1: // Plain old text message, let's wrap it in a Maquis packet
          let packet = {
            body: new TextDecoder().decode(pkt.payloadVariant.value.payload),
            sid: pkt.from, // TODO: query the device to know who the sender is
            ts: new Date().getTime(),
            type: 'message' // can also be [ack,coords]
          }
          const encodedPacket = await MaquisPacket.encode(packet);

          this.onMessage(encodedPacket);
          break;
          case 256: // Private app of some sort (assume it's maquis :) )
          this.onMessage(pkt.payloadVariant.value.payload);
          break;
        }
      });

      cb();
    }

    async transmit(message) {
      let response = await this.device.sendPacket(message, 256, "broadcast", 0, false, false);
      // If we're sending in the clear, might as well, right?
    }

};

export default Meshtastic;
