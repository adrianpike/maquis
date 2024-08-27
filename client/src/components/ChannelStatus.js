import {h, render, Component, createRef} from 'preact';

class ConnectButton extends Component {
  constructor() {
    super();

    this.state = {
      error: null
    }
  }

  render({ channel, onConnect, onDisconnect, connected }) {
    if (connected) {
      return <div><input type="button" value="Disconnect" onClick={() => {
      }} /></div>
    } else {
      return <div><input type="button" value="Connect" onClick={() => {
        // BUG: what do we do about errors after the channel
        // has connected?
        channel.connect((err) => {
          if (err) {
            this.setState( { error: err.toString() })
          } else {
            onConnect();
          }
        });
      }} />{this.state.error}</div>
    }
  }
}

class ChannelStatus extends Component {
  render({ channel, connected, onConnect }) {
    return <div id="channelStatus">
      <ConnectButton 
        channel={channel}
        connected={connected}
        onConnect={() => { 
          onConnect();
        }}
      />
    </div>
  }
}

export default ChannelStatus;
