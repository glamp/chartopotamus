import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import Button from './components/Button';
import Tablue from './Tablue';
import axios from 'axios';
import './App.css';

let datasets = {};

class App extends React.Component {
  state = { dataset: null };

  componentDidMount() {
    axios.get('/glamp/tablue/raw/master/src/datasets/diamonds.json')
      .then(response => {
        datasets['diamonds'] = response.data;
      })

    axios.get('/glamp/tablue/raw/master/src/datasets/iris.json')
      .then(response => {
        datasets['iris'] = response.data;
      })
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
      return <Tablue data={this.state.dataset} />;
    }
    return (
      <div>
        <Row center="xs" middle="xs" className="box" style={{ height: window.innerHeight / 2 }}>
          <Col xs={6}>
            <Dropzone onDrop={this.onDrop} style={{ width: '100%' }}>
              <p>Drag and drop a <b>.csv or .json</b> file here, or click to select files to upload.</p>
            </Dropzone>
            <p>Select a dataset.</p>
            <Button onClick={() => this.setState({ dataset: datasets['diamonds'] })}>diamonds</Button>
            {' '}
            <Button onClick={() => this.setState({ dataset: datasets['iris'] })}>iris</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
