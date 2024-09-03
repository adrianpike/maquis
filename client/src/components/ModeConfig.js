import {h, render, Component, createRef} from 'preact';
import {IonItem, IonInput } from '@ionic/react';

class AcousticConfig extends Component {
  render() {
    return <em></em>
  }
}

class WebsocketConfig extends Component {
  render({config, setState}) {
    return <IonItem>
      <IonInput label="Websocket URL" type="text" name="url" value={config.url}
              onIonInput={(e) => {
                setState({ url: e.target.value });
              }}
            />
    </IonItem>
  }
}

class ModeConfig extends Component {
  render({mode, config, setState}) {
    switch(mode) {
      case 'Commbloc':
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
