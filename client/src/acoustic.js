const WebJack = require('webjack');

class Acoustic {

  constructor() {
    this.profile = {
      baud: 300,
      freqLow: 1200,
      freqHigh: 2400,
      echoCancellation: false,
      softmodem: false
    };
    this.started = false;
  }

  connect(cb) {
    try {
      this.audioConnection = new WebJack.Connection(this.profile);
      window.ac = this.audioConnection;
      this.audioConnection.listen((data) => {
        console.log('received: ' + data);
        if (typeof(this.onMessage) === 'function') {
          this.onMessage(data);
        }
      });
      this.connected = true;
      cb();
    } catch (e) {
      cb(e);
    }
  }

  transmit(message) {
    if (this.audioConnection) {
      this.audioConnection.send(message);
    }
  }
}

module.exports = Acoustic;
