import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import Button from './components/Button';
import Tablue from './Tablue';
import datasets from './datasets';
import bkg from './background.png';
import './App.css';


class App extends React.Component {
  state = { dataset: null, width: -1, height: -1 };
  // state = { dataset: datasets.iris, width: -1, height: -1 };

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
  
  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  onDrop = (files) => {
    let file = files[0];
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onloadend = () => {
      try {
        this.setState({ dataset: JSON.parse(reader.result) });
      } catch(e) {
        try {
          this.setState({ dataset: Papa.parse(reader.result, { header: true, dynamicTyping: true }).data });
        } catch(e) {
          alert("Couldn't read your file! " + e);
        }
      }
    }
  }

  render() {
    if (this.state.dataset) {
      return (
        <div className="app">
          <Tablue data={this.state.dataset} />
        </div>
      );
    }
    return (
      <div style={{ height: window.innerHeight, backgroundImage: `url(${bkg})`, backgroundRepeat: 'none', backgroundPosition: '0 0', backgroundSize: 'cover' }}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <Row center="xs" middle="xs" style={{ height: window.innerHeight / 2 }}>
          <Dropzone onDrop={this.onDrop} className="box">
            <Col xs={12}>
                <p>Drag and drop a <b>.csv or .json</b> file here, or click to select files to upload.</p>
                <p>or</p>
                <p>Select a pre-made dataset.</p>
            </Col>
          </Dropzone>
          <div style={{ position: 'absolute', right: window.innerWidth / 2 - 155, top: 340  + (window.innerHeight - 626)/5  }}>
            <Button
              animated
              onClick={() => this.setState({ dataset: datasets['diamonds'] })}
              >
                <span role="img">💎</span>{' '}diamonds
            </Button>
            {' '}
            <Button
              animated
              animationDelay={0.07}
              onClick={() => this.setState({ dataset: datasets['iris'] })}>
                <span role="img">🌺</span>{' '}iris
            </Button>
            {' '}
            <Button
              animated
              animationDelay={0.14}
              onClick={() => this.setState({ dataset: datasets['meat'] })}>
                <span role="img">🥩</span> {' '}meat
            </Button>
            {' '}
            <Button
              animated
              animationDelay={0.21}
              onClick={() => this.setState({ dataset: datasets['pigeons'] })}>
                <span role="img">🐦</span> {' '}pigeons
            </Button>
          </div>
        </Row>
      </div>
    );
  }
}

export default App;
