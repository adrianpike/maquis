const ws = require('ws');

class Websocket {
  constructor() {
  }

  connect(cb) {
    this.socket = new WebSocket('ws://10.10.2.115:4242');
    this.socket.addEventListener('message', (evt) => {
      evt.data.text().then(function(text) {
        console.log(text);
        if (typeof(this.onMessage) === 'function') {
          this.onMessage(text);
        }
      });
    });

    // this.socket.addEventListener('error', -- do something

    cb();
  }

  transmit(message) {
    this.socket.send(message);
  }
}

module.exports = Websocket;
