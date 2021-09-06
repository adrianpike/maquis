import {h, render, Component, createRef} from 'preact';

class MessageLog extends Component {
  render({messages, onRetransmit}) {

    return <div id="messageLog">
      { messages.slice(0).reverse().map(function(msg) {

      let directionIcon;
      let ackStatusIcon = '';
      let retransmitButton = '';
      if (msg.direction === 'outgoing') {
        retransmitButton = <div class="retransmitButton">Retransmit</div>

        if (msg.requestAck) {
          if (msg.acked) {
            ackStatusIcon = '+';
            retransmitButton = '';
          } else {
            ackStatusIcon = '?';
          }
        }  
        directionIcon = '⬆';
      } else {
        directionIcon = '⬇';
      }

       return <div class="message">
        <div class="sender">{msg.sid}</div>
        <div class="timestamp">
          {msg.ts}
          <span>{msg.receivedAt}</span>
        </div>
        <div class="controls">
          {directionIcon}
          {ackStatusIcon}
          {retransmitButton}
        </div>
        <div class="body">{msg.body}</div>
        </div>
      }) }
    </div>
  }
}

export default MessageLog;
