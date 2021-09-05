import {h, render, Component} from 'preact';

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
      <textarea value={this.state.text} onChange={(e) => {
        this.setState({ text: e.target.value });
      }}>{this.state.text}</textarea>
      <input type="submit" value="Send" />
    </form>
  }
}

export default MessageComposer;
