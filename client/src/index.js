import {h, render, Component, createRef} from 'preact';
import 'normalize.css';
import './style.css';

const MaquisPacket = require('./maquis-packet.js');

// Modes
const Acoustic = require('./acoustic.js');
let acoustic = new Acoustic();

const Websocket = require('./websocket.js');
let websocket = new Websocket();

class MessageComposer extends Component {
  render(props, { text }) {
    return <form id="messageComposer" onSubmit={(e) => {
      e.preventDefault();
      if (typeof(text) === 'string' && text.length > 0) {
        props.onSubmit(text);
        this.setState({ text: '' });
      }
      return false;
    }}>
      <textarea value={this.state.text} onChange={(e) => {
        this.setState({ text: e.target.value });
      }}>{this.state.text}</textarea>
      <input type="submit" value="Send" />
    </form>
  }
}

class MessageLog extends Component {
  render({messages}) {
    console.log(messages);

    return <div id="messageLog">
      { messages.slice(0).reverse().map(function(msg) {
/*
{
  sid: sender
  receivedAt: new Date()
  ts: sent at
  deliveryStatus: [ received, sent w/o ack, sent pending ack, sent & acked ]
  body
} */

let deliveryStatusIcon = '';
let retransmitButton = <div class="retransmitButton">Retransmit</div>

       return <div class="message">
        <div class="sender">{msg.sid}</div>
        <div class="timestamp">
          {msg.ts}
          <span>{msg.receivedAt}</span>
        </div>
        <div class="controls">
          {deliveryStatusIcon}
          {retransmitButton}
        </div>
        <div class="body">{msg.body}</div>
        </div>
      }) }
    </div>
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
  render({ channel, connected, onConnect }) {
    return <div id="channelStatus">
      { connected ? 'Connected' : <ConnectButton 
        channel={channel}
        success={() => { 
          this.setState( { connected: true });
          onConnect();
        }}
      />}
    </div>
  }
}

class ConfigPane extends Component {
  constructor({config}) {
    super();

    this.state = config;
  }

  render({onSubmit}) {
    return <div id="config">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(this.state);
        return false;
      }}>
        <label>Operating Mode:
          <select name="mode" value={this.state.mode} onChange={(e) => {
            this.setState({ mode: e.target.value }); 
          }}>
            { ['Acoustic', 'Websocket'].map((mode) => {
              return <option value={mode}>{mode}</option>;
            }) }
          </select>
        </label>

        <label>Station ID:
          <input type="text" name="id" value={this.state.sid}
            onInput={(e) => {
              this.setState({ sid: e.target.value });
            }}
          />
        </label>

        <label>Crypto Mode:
          <select name="cryptoMode">
              <option value="none" selected>None</option>
              <option value="sign">Sign Messages</option>
              <option value="encrypt">Encrypt Messages</option>
            </select>
        </label>

        <label>Private Key:
          <textarea name="privateKey" value={this.state.privateKey} onChange={(e) => {
            this.setState({ privateKey: e.target.value });
          }}>{this.state.privateKey}</textarea>
        </label>
        
        <input type="submit" value="Save" />
      </form>
    </div>
  }
}

class MaquisBase extends Component {
  constructor() {
    super();

    this.state = {
      config: {
        mode: 'Acoustic',
        modeConfig: {
          baud: 300, // 300, 1200, 1200 w/AX.25 framing [ future wish :) ]
          retransmit: 1
        },
        showRaw: true,
        transmitProtocolVersion: 0, // We'll be backward-compatible to receive the last N protocols where N is my sanity :)
        privateKey: undefined,
        publicKey: undefined,
        sid: 'Spartacus', // TODO: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
        cryptoMode: 'none' // { none, sign, full (but we need a given pubkey to target) } // todo: use signal protocol for v1
      },
      messages: [],
      configVisible: false,
      connected: false
    }

    let persistentConfig;
    try {
      persistentConfig = JSON.parse(window.localStorage.getItem('config'));
    } catch(e) {
      persistentConfig = {};
    }
    for (let key in persistentConfig) {
      this.state.config[key] = persistentConfig[key];
    }

    switch(this.state.config['mode']) {
      case 'Websocket':
        this.channel = websocket;
        break;
      default:
        this.channel = acoustic;
    }

    this.channel.onMessage = (packet) => {
      let message = MaquisPacket.decode(packet);
      if (message.requestAck && message.requestAck == true) {
        // ack it!
      }
      this.setState({ messages: this.state.messages.concat([message]) });
    }

    if (this.state.config['mode'] === 'Websocket') {
      this.channel.connect(() => {
        this.setState({ connected: true });
      });
    }

  }

  render() {
    let channel = this.channel;
    return <div id="maquis">
      <div id="header">
        <a id="logo" href="#" onClick={() => {
          this.setState({ configVisible: true });
        }}>maquis</a>
        <ChannelStatus channel={channel} connected={this.state.connected} onConnect={() => {
          this.setState({ connected: true }); 
        }} />
      </div>
      {this.state.configVisible &&
      <ConfigPane config={this.state.config} onSubmit={(newConfig) => {
        // BUG: blows away existing default config, need to merge
        this.setState({config: newConfig, configVisible: false});
        window.localStorage.setItem('config', JSON.stringify(newConfig));
      }} />}
      {this.state.connected ?
      <MessageComposer onSubmit={(body) => {
        let message = {
          body: body, // TODO: body can be geo coords
          sid: this.state.config.sid,
          ts: new Date().getTime(),
          sig: '', // TODO
          requestAck: true
        }
        const packet = MaquisPacket.encode(message);
        channel.transmit(packet);

        // Probably need to translate message to an internal type here
        this.setState({ messages: this.state.messages.concat([message]) }); 
      }} />
      : <div id="disconnectionWarning">{this.state.config.mode} Backend disconnected.</div>
      }
      <MessageLog messages={this.state.messages} />
    </div>
  }
}

render((
  <MaquisBase />
), document.body);
