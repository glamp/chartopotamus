import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BarChart2 as BarChart2Icon, List as ListIcon, MoreHorizontal as MoreHorizontalIcon, MoreVertical as MoreVerticalIcon, Layers as LayersIcon, Hash as HashIcon, Italic as ItalicIcon } from 'react-feather';
import { Row, Col } from 'react-flexbox-grid';
import ChartIcon from './components/ChartIcon';
import DroppableFacet from './components/DroppableFacet';
import SummaryGrid from './components/SummaryGrid';
import Chart from './components/Chart';
import palettes from './utils/palettes';
import symbols from './utils/symbols';
import calcAvailableCharts from './utils/calc-available-charts';
import _ from 'lodash';
import { scaleLinear } from 'd3';
import './App.css';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const renderField = ({ content, type }) => (
  <div>
    {type==='number' ? <HashIcon size={12} /> : <ItalicIcon size={12} />}
    {' '}
    {content}
  </div>
);

const getItemStyle = (isDragging, draggableStyle, inline) => ({
  display: inline ? 'inline-block' : 'block',
  // change background colour if dragging
  background: isDragging ? '#59af50c9' : 'white',
  // styles we need to apply on draggables
  ...draggableStyle
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: _.orderBy(_.keys(props.data[0]).map(col => (
        {
          id: `item-${col}`,
          content: col,
          type: _.isNumber(props.data[0][col]) ? 'number' : 'categorical'
        }
      )), ['type', 'content'], ['asc', 'asc']),
      rows: [],
      columns: [],

      selectedColor: {},
      selectedShape: {},
      selectedSize: {},

      selectedChart: 'table',

      colorScaler: x => palettes.categorical(1).next().value,
      shapeScaler: x => 'circle',
      sizeScaler: x => 6,
      displayLegend: true,
    };
  }

  onDragEnd = (result) => {
    const { source, destination } = result;
    const facets = [
      'selectedColor',
      'selectedSize',
      'selectedShape',
    ];

    if (! destination) {
      if (_.indexOf(facets, source.droppableId) > -1) {
        this.setState({ [source.droppableId]: {} });
      }
      this.setState({ selectedChart: calcAvailableCharts(this.state, this.props.data).best });
      return;
    }

    if (_.indexOf(facets, destination.droppableId) > -1) {
      const newItem = _.clone(result);
      this.setState({
        [destination.droppableId]: { id: newItem.draggableId, content: this.state.fields[newItem.source.index].content }
      });
      this.updateColorPalette();
      this.updateShapeScaler();
      this.updateSizeScaler();
      this.setState({ selectedChart: calcAvailableCharts(this.state, this.props.data).best });
      return;
    }
    if (_.indexOf(['rows', 'columns'], destination.droppableId) > -1) {
      const newItem = _.clone(result);
      let data = this.state[destination.droppableId];

      data.splice(destination.index, 0, {
        id: `${destination.droppableId}-${newItem.draggableId}`,
        content: this.state.fields[newItem.source.index].content
      });
      this.setState({ [destination.droppableId]: data });
      this.setState({ selectedChart: calcAvailableCharts(this.state, this.props.data).best });
      return;
    }
  }

  updateColorPalette() {
    if (_.isEmpty(this.state.selectedColor)) {
      this.setState({
        colorScaler: x => palettes.categorical(1).next().value,
        displayLegend: false,
      });
      return;
    }

    const values = _.uniq(_.map(this.props.data, this.state.selectedColor.content));
    const palette = palettes.categorical(values.length);
    let colorScaler = {};
    values.map(x => {
      colorScaler[x] = palette.next().value;
    })
    this.setState({ colorScaler, displayLegend: true });
  }

  updateShapeScaler() {
    if (_.isEmpty(this.state.selectedShape)) {
      this.setState({
        shapeScaler: x => 'circle',
        displayLegend: false,
      });
      return;
    }

    let shapeScaler = {};
    const symbolGen = symbols.symbolGenerator();
    _.uniq(_.map(this.props.data, this.state.selectedShape.content)).map(x => {
      shapeScaler[x] = symbolGen.next().value;
    });
    this.setState({ shapeScaler, displayLegend: true });
  }

  updateSizeScaler() {
    if (_.isEmpty(this.state.selectedSize)) {
      this.setState({
        sizeScaler: (x) => 6,
        displayLegend: false,
      });
      return;
    }
    const low = _.minBy(this.props.data, this.state.selectedSize.content)[this.state.selectedSize.content];
    const high = _.maxBy(this.props.data, this.state.selectedSize.content)[this.state.selectedSize.content];
    const sizeScaler = scaleLinear().domain([low, high]).range([2, 12]);
    this.setState({ sizeScaler });
  }

  removeField = (key, fieldId) => {
    let state = this.state;
    let newKey = state[key].filter(x => x.id!==fieldId);
    state[key] = newKey;
    this.setState(state);
    this.setState({ selectedChart: calcAvailableCharts(this.state, this.props.data).best });
  }

  renderChart = (datum) => {
    const chartType = this.state.selectedChart;
    const { columns } = this.state;
    if (chartType==='table') {
      return <SummaryGrid data={datum} />;
    }
    if (chartType==='histogram' || chartType==='bar') {
      let datasets = _.values(_.groupBy(datum, row => row[this.state.selectedColor.content]));
      datasets = datasets.map((dataset, idx) => {
        const column = columns[0];
        return {
          x: _.map(dataset, column.content),
          type: 'histogram',
          name: dataset[0][this.state.selectedColor.content],
        }
      });
      return <Chart data={datasets} />;
    }

    if (chartType==='scatter') {
      let color;
      if (! _.isEmpty(this.state.selectedColor)) {
        color = _.map(datum, x => this.state.colorScaler[x[this.state.selectedColor.content]]);
      }

      let size;
      if (! _.isEmpty(this.state.selectedSize)) {
        size = _.map(datum, x => this.state.sizeScaler(x[this.state.selectedSize.content]));
      }

      let shapes;
      if (! _.isEmpty(this.state.selectedShape)) {
        shapes = _.map(datum, x => this.state.shapeScaler[x[this.state.selectedShape.content]]);
      }

      const fieldsToGroupBy = [
        this.state.selectedColor.content,
        this.state.selectedSize.content,
        this.state.selectedShape.content
      ].filter(x => !_.isNil(x));
      const datasets = _.toPairs(_.groupBy(datum, x => _.values(_.pick(x, fieldsToGroupBy)).join(', '))).map(subset => {
        let marker = {};
        if (! _.isEmpty(this.state.selectedColor)) {
          marker.color = this.state.colorScaler[subset[1][0][this.state.selectedColor.content]];
        } else {
          marker.color = 'steelblue';
        }
        if (! _.isEmpty(this.state.selectedSize)) {
          marker.size = this.state.sizeScaler(subset[1][0][this.state.selectedSize.content]);
        }
        if (! _.isEmpty(this.state.selectedShape)) {
          marker.symbol = this.state.shapeScaler[subset[1][0][this.state.selectedShape.content]];
        }
        return {
          x: _.map(subset[1], columns[0].content),
          y: _.map(subset[1], columns[1].content),
          marker,
          mode: 'markers',
          type: 'scatter',
          name: subset[0], // datum[0][this.state.selectedColor.content]
        };
      });
      return <Chart data={datasets} />;
    }

  }

  render() {
    const currentlyAvailableCharts = calcAvailableCharts(this.state, this.props.data);
    const availableCharts = (
      <Row>
        <Col xs={6}><ChartIcon onClick={() => this.setState({ selectedChart: 'table' })} type="table" isSelected={this.state.selectedChart==='table'} isAvailable={currentlyAvailableCharts['table']} /></Col>
        <Col xs={6}><ChartIcon onClick={() => this.setState({ selectedChart: 'histogram' })} type="histogram" isSelected={this.state.selectedChart==='histogram'} isAvailable={currentlyAvailableCharts['histogram']} /></Col>
        <Col xs={6}><ChartIcon onClick={() => this.setState({ selectedChart: 'bar' })} type="bar" isSelected={this.state.selectedChart==='bar'} isAvailable={currentlyAvailableCharts['bar']} /></Col>
        <Col xs={6}><ChartIcon onClick={() => this.setState({ selectedChart: 'horizontalbar' })} type="horizontalbar" isSelected={this.state.selectedChart==='horizontalbar'} isAvailable={currentlyAvailableCharts['horizontalbar']} /></Col>
        <Col xs={6}><ChartIcon onClick={() => this.setState({ selectedChart: 'line' })} type="line" isSelected={this.state.selectedChart==='line'} isAvailable={currentlyAvailableCharts['line']} /></Col>
        <Col xs={6}><ChartIcon onClick={() => this.setState({ selectedChart: 'scatter' })} type="scatter" isSelected={this.state.selectedChart==='scatter'} isAvailable={currentlyAvailableCharts['scatter']} /></Col>
      </Row>
    );

    // TODO: add in color, shape, and size
    let dataGroups = [];
    const groupers = this.state.rows; // .concat([this.state.selectedColor, this.state.selectedShape, this.state.selectedSize]);
    dataGroups = _.groupBy(this.props.data, row => {
      const fields = _.map(groupers, 'content');
      if (!fields.length) {
        return '';
      }
      return _.values(_.pick(row, fields)).join(', ');
    });
    dataGroups = _.toPairs(dataGroups);


    return (
      <div className="app">
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Row around="xs">
            <Col xs={1}>
              <div className="center">
                <ListIcon size={12} />{' '}<small>Fields</small>
              </div>
              <hr />
              <Droppable droppableId="fields">
                {(provided, snapshot) => (
                  <div
                    className="droppable-facet"
                    ref={provided.innerRef}
                    style={{ border: 'none', borderRadius: 0, borderRight: '1px solid lightgrey', height: '100%', padding: 5, paddingRight: 30, }}
                    >
                    {this.state.fields.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}>
                        {(provided, snapshot) => (
                          <div
                            className="field"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}>
                            {renderField(item)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
            <Col xs={1} className="center">
              <LayersIcon size={12} />{' '}<small><b>Layers</b></small>
              <hr />
              <DroppableFacet name="Color" item={this.state.selectedColor} onClickX={() => this.setState({ selectedColor: {} })} />
              <br />
              <DroppableFacet name="Shape" item={this.state.selectedShape} onClickX={() => this.setState({ selectedShape: {} })} />
              <br />
              <DroppableFacet name="Size" item={this.state.selectedSize} onClickX={() => this.setState({ selectedSize: {} })} />
              <br />
              <br />
              <BarChart2Icon size={12} />{' '}<small><b>Chart Types</b></small>
              <hr />
              {availableCharts}
            </Col>
            <Col xs={8}>
              <Row middle="xs">
                <Col style={{ width: 70 }}>
                  <MoreHorizontalIcon size={12} />{' '}<small><b>{'Rows'}{'   '}</b></small>
                </Col>
                <Col xs={10}>
                  <Droppable droppableId="rows" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        className="card droppable-facet"
                        ref={provided.innerRef}>
                        {this.state.rows.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}>
                            {(provided, snapshot) => (
                              <span
                                className="field"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style,
                                  true
                                )}>
                                {item.content}
                                {' '}
                                <span onClick={() => this.removeField('rows', item.id)} style={{ color: 'red', cursor: 'pointer' }}>{'×'}</span>
                              </span>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              </Row>
              <hr />
              <Row middle="xs">
                <Col style={{ width: 70 }}>
                  <MoreVerticalIcon size={12} />{' '}<small><b>Columns</b></small>
                </Col>
                <Col xs={10}>
                  <Droppable droppableId="columns" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        className="card droppable-facet"
                        ref={provided.innerRef}>
                        {this.state.columns.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}>
                            {(provided, snapshot) => (
                              <span
                                className="field"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                >
                                {item.content}
                                {' '}
                                <span onClick={() => this.removeField('columns', item.id)} style={{ color: 'red', cursor: 'pointer' }}>{'×'}</span>
                              </span>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              </Row>
              <br />
                {
                  dataGroups.map((group, i) => (
                    <div>
                      <p><u><b>{group[0]}</b></u></p>
                      {this.renderChart(group[1])}
                    </div>
                  ))
                }
            </Col>
          </Row>
        </DragDropContext>
      </div>
    );
  }
}

export default App;
