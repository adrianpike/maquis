import {h, render, Component, createRef} from 'preact';
import ModeConfig from './ModeConfig';

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
        <label>Operating Mode:
          <select name="mode" value={this.state.mode} onChange={(e) => {
            this.setState({ mode: e.target.value }); 
          }}>
            { ['Acoustic', 'Websocket'].map((mode) => {
              return <option value={mode}>{mode}</option>;
            }) }
          </select>
        </label>

        <ModeConfig mode={this.state.mode} config={this.state.modeConfig} setState={(stateMutation) => {
          this.setState(stateMutation);
        }} />

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
              <option value="encrypt">Encrypt Messages</option>
            </select>
        </label>
        
        <label>Symmetric Key:
          <textarea name="symmetricKey" value={this.state.symmetricKey} onChange={(e) => {
            this.setState({ symmetricKey: e.target.value });
          }}>{this.state.symmetricKey}</textarea>
        </label>
        <button onClick={(e) => {
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
        }}>Generate New Key</button>

        <label for="requestAck">Request Acknowledgement:
          <input type="checkbox" name="requestAck" value="true" />
        </label>
        
        <input type="submit" value="Save" />
      </form>
    </div>
  }
}
