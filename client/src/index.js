import {h, render, Component, createRef} from 'preact';
import 'normalize.css';
import './style.css';

import MessageComposer from './components/MessageComposer';
import MessageLog from './components/MessageLog';
import ChannelStatus from './components/ChannelStatus';
import MaquisConfig from './components/MaquisConfig';

import { RandomPrintableString } from './utils/crypto';

import { MaquisNode } from './lib/MaquisNode';

const DEFAULT_CONFIG = {
  mode: 'Acoustic',
  modeConfig: {
    baud: 300, // 300, 1200, 1200 w/AX.25 framing [ future wish :) ]
    retransmit: 1,
    url: document.location.hostname // FIXME For websocket, need to split out default configs
  },
  showRaw: true,
  symmetricKey: undefined,
  requestAck: false,
  sid: 'Spartacus-' + RandomPrintableString(4),
  cryptoMode: 'none' // { none, sign, aes, signal } // Future PKI?
};

class MaquisBase extends Component {
  constructor() {
    super();

    this.maquisNode = new MaquisNode();

    this.state = { // This is the default and initial state :)
      config: DEFAULT_CONFIG,
      messages: [],
      configVisible: false,
      connected: false,
      connectionError: null
    }

    let persistentConfig;
    try {
      persistentConfig = JSON.parse(window.localStorage.getItem('config'));
    } catch(e) {
      persistentConfig = {};
    }
    for (let key in persistentConfig) { this.state.config[key] = persistentConfig[key]; }

    this.maquisNode.onMessage = this.onMessage.bind(this);
    this.maquisNode.onMessageAck = this.onMessageAck.bind(this);
    this.maquisNode.onConnect = this.onConnect.bind(this);

    this.maquisNode.applyConfig(this.state.config);
  }

  onConnect(error) {
    if (!error) {
      this.setState({ connected: true, connectionError: null });
    } else {
      this.setState({ connected: false, connectionError: error });
    }
  }

  onMessage(message) {
    this.setState({ messages: this.state.messages.concat([message]) });
  }

  onMessageAck(message) {
    let newMessages = this.state.messages.map((message) => {
      if (message.direction === 'outgoing' && message.digest == packet.msgHash) {
        message.acked = true;
      }
      return message;
    });
    this.setState({ messages: newMessages });
  }

  sendMessage(messageBody) {
    this.maquisNode.sendMessage(messageBody, (message) => {
      this.setState({ messages: this.state.messages.concat([message]) });
    });
  }

  render() {
    return <div id="maquis">
      <div id="header">
        <a id="logo" href="#" onClick={() => {
          this.setState({ configVisible: true });
        }}>maquis</a>
        <ChannelStatus channel={this.maquisNode.channel} connected={this.state.connected} onConnect={() => {
          this.setState({ connected: true }); 
        }} />
      </div>
      {this.state.configVisible &&
      <MaquisConfig config={this.state.config} onSubmit={(newConfig) => {
        this.setState({config: Object.assign({}, this.state.config, newConfig), configVisible: false});
        window.localStorage.setItem('config', JSON.stringify(newConfig));

        // TODO: clean up dirty channels if they changed
        this.applyConfig();
      }} />}
      {this.state.connected ?
      <MessageComposer onSubmit={(body) => {
        this.sendMessage(body);
      }} />
      : <div id="disconnectionWarning">{this.state.config.mode} Backend <strong>not connected</strong>.</div>
      }
      <MessageLog messages={this.state.messages} />
    </div>
  }
}

render((
  <MaquisBase />
), document.body);
