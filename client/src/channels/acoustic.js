const WebJack = require('webjack');

class Acoustic {

  constructor(config) {

    // this is a good profile for webjack -> webjack, but Direwolf seems to struggle interpreting it
    this.profile = {
      baud: 300,
      freqLow: 1200,
      freqHigh: 2400,
      echoCancellation: false,
      softmodem: false,
      raw: true
    };
/*
    // Lets see if I can do X.25 radio compat someday
    this.profile = {
      baud: 1200, // Officially 1200, but.. sample rate :)
      freqLow: 1200,
      freqHigh: 2200,
      echoCancellation: false,
      softmodem: false,
      nrzi: false,
      audioCtx: this.audioContext
    }
*/
    this.started = false;
  }

  connect(cb) {
    if (navigator.mediaDevices) {
      let AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      try {
        this.audioConnection = new WebJack.Connection(this.profile);
        window.ac = this.audioConnection;
        this.audioConnection.listen((data) => {
          if (typeof(this.onMessage) === 'function') {
            this.onMessage(data);
          }
        });
        this.connected = true;
        cb();
      } catch (e) {
        debugger
        cb(e);
      }
    } else {
      cb("No Audio devices available.");
    }
  }

  transmit(message) {
    if (this.audioConnection) {
      this.audioConnection.send(message);
    }
  }
}

module.exports = Acoustic;
