import {Html5QrcodeScanner} from "html5-qrcode";
import {h, render, Component, createRef} from 'preact';

class QRScanner extends Component {  
  ref = createRef();

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.ref.current) {

      function onScanSuccess(decodedText, decodedResult) {
        // handle the scanned code as you like, for example:
        console.log(`Code matched = ${decodedText}`, decodedResult);
      }
      
      function onScanFailure(error) {
        // handle scan failure, usually better to ignore and keep scanning.
        // for example:
        console.warn(`Code scan error = ${error}`);
      }
      
      let html5QrcodeScanner = new Html5QrcodeScanner(
        "qrReader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        /* verbose= */ false);
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    }
  }
  
  render() {
    return <div ref={this.ref} id="qrReader" width="600px"></div>
  }
}

export default QRScanner;
