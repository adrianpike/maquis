const ws = require('ws');

class Websocket {

  constructor(config) {
    this.config = config;
  }

  connect(cb) {
    try {
      this.socket = new WebSocket(`ws://${this.config.url}`);
      this.socket.binaryType = 'arraybuffer';
      this.socket.addEventListener('message', (evt) => {
        if (typeof(this.onMessage) === 'function') {
          this.onMessage(evt.data);
        }
      });
    } catch(e) {
      cb('Unable to initialize websocket.');
      return;
    }

    this.socket.addEventListener('error', (err) => {
      console.log('Error connecting to websocket', err);
      cb('Unable to connect.');
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
