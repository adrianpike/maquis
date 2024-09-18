import {h, render, Component, createRef} from 'preact';
import {IonItem, IonInput, IonSelect, IonSelectOption } from '@ionic/react';

class AcousticConfig extends Component {
  render() {
    return <em></em>
  }
}

class MeshtasticConfig extends Component {
  render({config, setState}) {
    return <IonItem>
            <IonSelect label="Connection Type" placeholder="Connection Type"
            name="connectionType" value={config.connectionType} onIonChange={(e) => {
              setState({ connectionType: e.target.value }); 
            }}>
              { ['BLE', 'Serial'].map((connectionType) => {
                  return <IonSelectOption value={connectionType}>{connectionType}</IonSelectOption>;
                }) }
            </IonSelect>
          </IonItem>
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
      case 'Meshtastic' :
        return <MeshtasticConfig config={config} setState={(e) => {
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
