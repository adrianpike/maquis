const ws = require('ws');

class Websocket {
  constructor() {
  }

  connect(cb) {
    this.socket = new WebSocket('ws://10.10.2.115:4242');
    this.socket.binaryType = 'arraybuffer';
    this.socket.addEventListener('message', (evt) => {
      if (typeof(this.onMessage) === 'function') {
        this.onMessage(evt.data);
      }
    });

    this.socket.addEventListener('error', (err) => {
      console.log(err);
    });

    this.socket.addEventListener('open', (evt) => {
      this.connected = true;
    });

    cb();
  }

  transmit(message) {
    try {
      this.socket.send(message);
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = Websocket;
