import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonText, IonIcon } from '@ionic/react';
import { arrowUpCircleOutline } from 'ionicons/icons';

import {h, render, Component, createRef} from 'preact';

class Message extends Component {
  render(msg) {


  }
}

class Timestamp extends Component {
  render({ts}) {
    return <div>{ts}</div>
  }
}

class MessageLog extends Component {
  render({messages, onRetransmit}) {

    return <div id="messageLog">
      { messages.slice(0).reverse().map(function(msg) {

      let directionIcon;
      let ackStatusIcon = '';
      let retransmitButton = '';
      if (msg.direction === 'outgoing') {
        if (msg.requestAck) {
          if (msg.acked) {
            ackStatusIcon = '+';
            retransmitButton = '';
          } else {
            ackStatusIcon = '?';
          }
        }  
        directionIcon = arrowUpCircleOutline;
      } else {
        directionIcon = '⬇';
      }

       return <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            {msg.sid}
          </IonCardTitle>

          <IonCardSubtitle>
            <Timestamp ts={msg.ts} label="Timestamp" />
            <Timestamp ts={msg.receivedAt} label="Received At"/>
            <IonIcon icon={directionIcon}></IonIcon>
            <IonIcon icon={ackStatusIcon}></IonIcon>
          </IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText color="primary">
            <h1>{msg.body}</h1>
          </IonText>
        </IonCardContent>
        <IonButton
          onClick={() => {
            onRetransmit(msg.body)
          }}
        >Retransmit</IonButton>
       </IonCard>

      }) }
    </div>
  }
}

export default MessageLog;
