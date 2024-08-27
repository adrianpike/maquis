import {h, render, Component, createRef} from 'preact';
import ModeConfig from './ModeConfig';
import { IonList, IonItem, IonSelect, IonSelectOption, IonInput, IonTextarea, IonButton, IonCheckbox } from '@ionic/react';


export default class MaquisConfig extends Component {
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

        <IonList>
          <IonItem>
            <IonSelect label="Operating Mode" placeholder="Operating Mode"
            name="mode" value={this.state.mode} onIonChange={(e) => {
              this.setState({ mode: e.target.value }); 
            }}>
              { ['Acoustic', 'Commbloc', 'Sneakerdrop'].map((mode) => {
                  return <IonSelectOption value={mode}>{mode}</IonSelectOption>;
                }) }
            </IonSelect>
          </IonItem>

          <ModeConfig mode={this.state.mode} config={this.state.modeConfig} setState={(stateMutation) => {
            this.setState(stateMutation);
          }} />

          <IonItem>
            <IonInput label="Station ID" type="text" name="id" value={this.state.sid}
              onIonInput={(e) => {
                this.setState({ sid: e.target.value });
              }}
            />
          </IonItem>
            
          <IonItem>
           <IonSelect label="Crypto Mode" name="cryptoMode">
              <IonSelectOption value="none" selected>None</IonSelectOption>
              <IonSelectOption value="encrypt">Encrypt Messages</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonTextarea name="symmetricKey" label="Symmetric Key" onIonChange={(e) => {
              this.setState({ symmetricKey: e.target.value });
            }}
              value={this.state.symmetricKey}>
              <IonButton fill="clear" slot="end" aria-label="Generate"
                onClick={(e) => {
                  // TODO: throw an error or confirmation if there's a key already here
                  crypto.subtle.generateKey(
                    {
                        name: "AES-GCM",
                        length: 256,
                    },
                    true,
                    ["encrypt", "decrypt"]
                  ).then((rawKey) => {
                    // TODO: make our key need to be re-exported
                    crypto.subtle.exportKey('raw', rawKey).then((key) => {
                      let b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));            
                      this.setState({ symmetricKey: b64 });
                    });
                  });
                  
                  e.preventDefault();
                  return false;
                }}
              >
                Generate
              </IonButton>
            </IonTextarea>
          </IonItem>

          <IonItem>
            <IonCheckbox type="checkbox" name="requestAck" value="true">Request Acknowledgement</IonCheckbox>
          </IonItem>

          <IonItem lines="none">
            <IonButton slot="end" type="submit">Save</IonButton>
          </IonItem>

        </IonList>
      </form>
    </div>
  }
}
