import {h, render, Component, createRef} from 'preact';

class AcousticConfig extends Component {
  render() {
    return <em></em>
  }
}

class WebsocketConfig extends Component {
  render({config, setState}) {
    return <div>
      <label>Websocket URL:
          <input type="text" name="url" value={config.url}
            onInput={(e) => {
              setState({ url: e.target.value });
            }}
          />
        </label>
    </div>
  }
}

class ModeConfig extends Component {
  render({mode, config, setState}) {
    switch(mode) {
      case 'Websocket':
        return <WebsocketConfig config={config} setState={(e) => {
          setState({ // This is pretty gross, got to be a better way
            modeConfig: e
          });
        }} />
        break;
      case 'Acoustic':
        return <AcousticConfig />
        break;
    }

  }
}

export default ModeConfig;
