var QRCode = require('qrcode');
import {h, render, Component, createRef} from 'preact';

class QRKey extends Component {  
  ref = createRef();

  constructor(props) {
    super(props);
    console.log(props);
  }

  componentDidMount() {
    if (this.ref.current) {
      let canvasElement = QRCode.toCanvas(this.ref.current, this.sKey, function (error) {
        if (error) { throw error }
      });
    }
  }
  
  render({ sKey }) {
    this.sKey = sKey;
    return <canvas ref={this.ref}></canvas>
  }
}

export default QRKey;
