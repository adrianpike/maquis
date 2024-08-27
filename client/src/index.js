import {h, render, Component, createRef} from 'preact';
import 'normalize.css';
import './style.css';

import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';

import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

import { IonApp } from '@ionic/react';
import { IonButton, IonIcon } from '@ionic/react';
import { cog } from 'ionicons/icons';


import {Sha256} from '@aws-crypto/sha256-js';

const MaquisPacket = require('./maquis-packet.js');

const Acoustic = require('./channels/acoustic.js');
const Websocket = require('./channels/websocket.js');

import MessageComposer from './components/MessageComposer';
import MessageLog from './components/MessageLog';
import ChannelStatus from './components/ChannelStatus';
import { RandomPrintableString } from './utils/crypto';
import MaquisConfig from './components/MaquisConfig';

const DEFAULT_CONFIG = {
  mode: 'Acoustic',
  modeConfig: {
    baud: 300, // 300, 1200, 1200 w/AX.25 framing [ future wish :) ]
    retransmit: 1,
    url: document.location.hostname // For websocket, need to split out default configs
  },
  showRaw: true,
  symmetricKey: undefined,
  requestAck: false,
  sid: 'Spartacus-' + RandomPrintableString(4),
  cryptoMode: 'none' // { none, sign, full (but we need a given pubkey to target) } // todo: use signal protocol if we have enough bandwidth? counter, would it be smarter to just tunnel IP and enable signal natively
};

class MaquisBase extends Component {
  constructor() {
    super();
    
    this.state = { // This is the default and initial state :)
      config: DEFAULT_CONFIG,
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
    for (let key in persistentConfig) { this.state.config[key] = persistentConfig[key]; }
    
    this.applyConfig();
  }
  
  applyConfig() {
    switch(this.state.config['mode']) {
      case 'Websocket':
      this.channel = new Websocket(this.state.config.modeConfig);;
      break;
      default:
      this.channel = new Acoustic(this.state.config.modeConfig);
    }
    
    this.channel.onMessage = this.onMessage.bind(this);;
    
    if (this.state.config['mode'] === 'Websocket') {
      this.channel.connect((err) => {
        if (!err) {
          this.setState({ connected: true });
        } else {
          // BUG: dont ignore this, tis silly
        }
      });
    }
  }
  
  onMessage(rawPacket) {
    let packet = MaquisPacket.decode(rawPacket);
    if (packet.requestAck && packet.requestAck == true) {
      // TODO: when there's encryption, i should only ack things i can decrypt
      let hash = new Sha256();
      hash.update(rawPacket);
      
      hash.digest().then((digest) => {
        let ackPacket = {
          msgHash: new TextDecoder().decode(digest),
          ackerId: this.state.config.sid,
          ts: new Date().getTime(),
        }
        const encodedPacket = MaquisPacket.encodeAck(ackPacket);
        debugger;
        this.channel.transmit(encodedPacket);
      });
    }
    
    if (packet.ackerId) {
      let newMessages = this.state.messages.map((message) => {
        if (message.direction === 'outgoing' && message.digest == packet.msgHash) {
          message.acked = true;
        }
        return message;
      });
      this.setState({ messages: newMessages });
    } else {
      let message = Object.assign({}, packet);
      message.acked = false;
      message.direction = 'incoming'; // Don't like this, maybe an enum?
      this.setState({ messages: this.state.messages.concat([message]) });
    }
  }
  
  sendMessage(messageBody) {
    let packet = {
      body: messageBody,
      sid: this.state.config.sid,
      ts: new Date().getTime(),
      sig: '', // TODO
      requestAck: true,
      type: 'message' // can also be [ack,coords]
    }
    const encodedPacket = MaquisPacket.encode(packet);
    
    if (this.state.config.cryptoMode != 'none') { // DEBUGGIN
      console.log('encrypting packet...');
      let b64 = atob(this.state.config.symmetricKey);
      const buf = new ArrayBuffer(b64.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = b64.length; i < strLen; i++) {
        bufView[i] = b64.charCodeAt(i);
      }    
      
      let key = window.crypto.subtle.importKey(
        "raw",
        bufView,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
      ).then(function(key) {
        let iv = window.crypto.getRandomValues(new Uint8Array(12));
        let encrypted = window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          encodedPacket
        );
        window.encrypted = encrypted;
      });
    }
    
    this.channel.transmit(encodedPacket);
    
    let message = Object.assign({}, packet);
    message.acked = false;
    message.direction = 'outgoing'; // Don't like this
    let hash = new Sha256();
    hash.update(encodedPacket);
    hash.digest().then((digest) => {
      message.digest = new TextDecoder().decode(digest),
      this.setState({ messages: this.state.messages.concat([message]) });
    });
  }
  
  render() {
    return (<IonApp>
      <ion-header>
        <ion-toolbar>
          <ion-title> 
            maquis
          </ion-title>
          <ion-buttons slot="secondary">
            <IonButton onClick={() => {
              let newConfig = !this.state.configVisible;
              this.setState({ configVisible: newConfig });
            }} fill="">
            <IonIcon slot="icon-only" icon={cog}></IonIcon>
          </IonButton>
          <ChannelStatus channel={this.channel} connected={this.state.connected} onConnect={() => {
            this.setState({ connected: true }); 
          }} />
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
      <div id="maquis">
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
        <MessageLog messages={this.state.messages} onRetransmit={this.sendMessage.bind(this)} />
        </div>
        
        </ion-content>
        </IonApp>)
        
      }
    }
    

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }



    render((
      <MaquisBase />
    ), document.body);
    