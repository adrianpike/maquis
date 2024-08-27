import {h, render, Component} from 'preact';
import { IonButton, IonTextarea } from '@ionic/react';

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
      <IonTextarea placeholder="Message" value={this.state.text} onChange={(e) => {
        this.setState({ text: e.target.value });
      }}></IonTextarea>

      <IonButton expand="block" type="submit">Send</IonButton>
    </form>
  }
}

export default MessageComposer;
