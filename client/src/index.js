import {h, render, Component} from 'preact';

// Modes
const Acoustic = require('./acoustic.js');
let acoustic = new Acoustic();
//const Websocket = require('./websocket.js');

class MessageComposer extends Component {
  render(props, { text }) {
    return <form onSubmit={(e) => {
      e.preventDefault();
      if (typeof(text) === 'string' && text.length > 0) {
        props.onSubmit(text);
        this.setState({ text: '' });
      }
      return false;
    }}>
      <input type="text" value={text} onInput={(e) => {
        this.setState({ text: e.target.value });
      }} />
      <input type="submit" value="Send" />
    </form>
  }
}

class MessageLog extends Component {
  render({messages}) {
    return <ul>
      { messages.map(function(msg) {
       return <li>{msg}</li>
      }) }
    </ul>
  }
}

class ConnectButton extends Component {
  constructor() {
    super();

    this.state = {
      error: null
    }
  }

  render({ channel, success }) {
    return <div><input type="button" value="Connect" onClick={() => {
      channel.connect((err) => {
        if (err) {
          this.setState( { error: err.toString() })
        } else {
          success();
        }
      });
    }} />{this.state.error}</div>
  }
}

class ChannelStatus extends Component {
  constructor({ channel }) {
    super();

    this.state = {
      conncted: channel.connected
    }
  }

  render({ channel }) {
    return <div>
      { this.state.connected ? 'Connected' : <ConnectButton 
        channel={channel}
        success={() => { this.setState( { connected: true })}}
      />}
    </div>
  }
}

class MaquisBase extends Component {
  constructor() {
    super();

    this.state = { // TODO: load the whole state, including message history, maybe?
      config: {
        mode: 'Acoustic',
        modeConfig: {},
        showRaw: true,
        kissMode: false, //TODO
        protocolVersion: 0, //TODO
      },
      messages: []
    }

    // this.channel = initialize it?
    acoustic.onMessage = (msg) => {
      console.log(msg, 'onmessage');
      this.setState({ messages: this.state.messages.concat([msg]) });
    }

    // TODO: attempt a connect on our first load?
  }

  render() {
    let channel = acoustic;
  return <div id="maquis">
    <h1>maquis</h1>
    <ChannelStatus channel={channel} />
    <MessageComposer onSubmit={(message) => {
      // const packet = MaquisPacket.encode(message);
      this.setState({ messages: this.state.messages.concat([message]) });
      channel.transmit(message);
    }} />
    <MessageLog messages={this.state.messages} />
  </div>
  }
}

render((
  <MaquisBase />
), document.body);

/*
// FEC magick
// const midnight = require('capn-midnight');

// Packetizer
const MaquisPacket = require('./maquis-packet.js');


ws = new WebSocket('ws://localhost:6969');
ws.send('hi');

*/
