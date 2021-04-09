const ws = require('ws');

class Websocket {
  constructor() {
  }

  connect(cb) {
    this.socket = new WebSocket(`ws://${document.location.hostname}:4242`);
    this.socket.binaryType = 'arraybuffer';
    this.socket.addEventListener('message', (evt) => {
      if (typeof(this.onMessage) === 'function') {
        this.onMessage(evt.data);
      }
    });

    this.socket.addEventListener('error', (err) => {
      cb(err);
      this.connected = false;
    });

    this.socket.addEventListener('open', (evt) => {
      cb();
      this.connected = true;
    });

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
