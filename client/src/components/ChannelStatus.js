import {h, render, Component, createRef} from 'preact';

class ConnectButton extends Component {
  constructor() {
    super();

    this.state = {
      error: null
    }
  }

  render({ channel, success }) {
    return <div><input type="button" value="Connect" onClick={() => {
      // BUG: what do we do about errors after the channel
      // has connected?
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
          onConnect();
        }}
      />}
    </div>
  }
}

export default ChannelStatus;
