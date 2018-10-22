import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Save as SaveIcon, Trash2 as Trash2Icon, BarChart2 as BarChart2Icon, List as ListIcon, Layers as LayersIcon } from 'react-feather';
import { Row, Col } from 'react-flexbox-grid';
import ChartIcon from './components/ChartIcon';
import DroppableFacet from './components/DroppableFacet';
import SummaryGrid from './components/SummaryGrid';
import Table from './components/Table';
import Chart from './components/Chart';
import Field from './components/Field';
import Button from './components/Button';
import AggregateableField from './components/AggregateableField';
import { calculateLayout } from './utils/layout';
import palettes from './utils/palettes';
import symbols from './utils/symbols';
import calcAvailableCharts from './utils/calc-available-charts';
import _ from 'lodash';
import { scaleLinear } from 'd3';
import './App.css';

const getItemStyle = (isDragging, draggableStyle, inline) => ({
  display: inline ? 'inline-block' : 'block',
  // styles we need to apply on draggables
  ...draggableStyle
});

const droppablePlaceholder = (
  <div style={{ color: 'lightgrey', marginTop: 6, marginLeft: 10 }}>
    <i>drag fields here</i>
  </div>
);

const getType = (value) => {
  if (_.isNumber(value)) {
    return 'number';
  }

  if (_.isDate(value)) {
    return 'date';
  }

  if (_.isBoolean(value)) {
    return 'boolean';
  }

  return 'categorical';
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: _.orderBy(_.keys(props.data[0]).map(col => (
        {
          id: `item-${col}`,
          content: col,
          type: getType(props.data[0][col])
        }
      )), ['type', 'content'], ['asc', 'asc']),
      rows: [
        // { id: 'item-clarity', content: 'clarity', type: 'categorical' },
        // { id: 'item-price', content: 'price', type: 'number' }
      ],
      columns: [
        // { id: 'item-cut', content: 'cut', type: 'categorical' },
        // { id: 'item-color', content: 'color', type: 'categorical' },
        // { id: 'item-carat', content: 'carat', type: 'number' }
      ],

      selectedColor: {},
      selectedShape: {},
      selectedSize: {},

      selectedChart: 'table',

      colorScaler: x => palettes.categorical(1).next().value,
      shapeScaler: x => 'circle',
      sizeScaler: x => 6,
      displayLegend: true,

      isDragging: false,

      width: -1,
      height: -1,
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
  
  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  sortRowsAndColumns(list) {
    return list.filter(x => x.type!=='number')
               .concat(list.filter(x => x.type==='number'));
  }

  onDragEnd = (result) => {
    this.setState({ isDragging: false });
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
        content: this.state.fields[newItem.source.index].content,
        type: this.state.fields[newItem.source.index].type,
      });

      data = this.sortRowsAndColumns(data);
      this.setState({ [destination.droppableId]: data });
      this.setState({ selectedChart: calcAvailableCharts(this.state, this.props.data).best });
      return;
    }

    if (source.droppableId==='fields' && destination.droppableId==='fields') {
      let { fields } = this.state;
      const field = fields[source.index];
      fields = _.filter(fields, (x, idx) => idx!==source.index);
      fields.splice(destination.index, 0, field);
      this.setState({ fields });
      return;
    }

  }

  onDragStart = () => {
    this.setState({ isDragging: true });
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
      return null;
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
      return null;
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

    /*
    if (_.isEmpty(columns)) {
      return <SummaryGrid data={datum} />;
    }
    */

    const layout = calculateLayout({
      data: this.props.data,
      rows: this.state.rows,
      columns: this.state.columns,
    });
    return (
      <div>
        <Chart
          data={layout.data}
          layout={layout.layout}
        />
        <pre>
          {JSON.stringify(layout, null, 2)}
        </pre>
      </div>
    );

    if (chartType==='table') {
      return <Table data={datum} />;
    }
    
    if (chartType==='summary') {
      return <SummaryGrid data={datum} />;
    }

    const fieldsToGroupBy = [
      this.state.selectedColor.content,
      this.state.selectedSize.content,
      this.state.selectedShape.content
    ].filter(x => !_.isNil(x));
    const datasets = _.toPairs(_.groupBy(datum, x => _.values(_.pick(x, fieldsToGroupBy)).join(', '))).map(subset => {
      let x, y, type, mode, orientation;

      const xColumn = columns[0];
      let yColumns = columns.slice(1);
      if (yColumns.length===0) {
        yColumns = [null];
      }
      return yColumns.map((yColumn, idx) => {

        if (chartType==='scatter') {
          x = _.map(subset[1], xColumn.content);
          y = _.map(subset[1], yColumn.content);
          type = 'scatter';
          mode = 'markers';
        } else if (chartType==='line') {
          x = _.map(subset[1], xColumn.content);
          y = _.map(subset[1], yColumn.content);
          mode = 'lines';
        } else if (chartType==='lineAndScatter') {
          x = _.map(subset[1], xColumn.content);
          y = _.map(subset[1], yColumn.content);
          type = 'scatter';
          mode = 'lines+markers';
        }  else if (chartType==='histogram' || chartType==='bar') {
          x = _.map(subset[1], xColumn.content);
          type = 'histogram';
        }  else if (chartType==='horizontalBar') {
          x = _.map(subset[1], xColumn.content);
          type = 'histogram';
          orientation = 'h';
        }

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
          name: subset[0], // datum[0][this.state.selectedColor.content]
          x,
          y,
          marker,
          mode,
          type,
          orientation,
        };
      });
    });
    const layout2 = {
      // xaxis: { title: _.get(this.state.columns, '[0].content'), titlefont: { family: 'Barlow' } },
      // yaxis: { title: _.get(this.state.columns, '[1].content'), titlefont: { family: 'Barlow' } },
    }
    return (
      <Chart
        data={_.flatten(datasets)}
        layout={layout}
      />
    );

  }

  getAvailableCharts = () => {
    const currentlyAvailableCharts = calcAvailableCharts(this.state, this.props.data);

    const chartTypes = [
      'table',
      'summary',
      'histogram', 
      'bar',
      'horizontalBar',
      'line',
      'scatter',
      'lineAndScatter',
    ];

    return (
      <Row>
        {
          chartTypes.map(type => (
            <Col xs={6}>
              <ChartIcon
                type={type} 
                onClick={() => this.setState({ selectedChart: type })}
                isSelected={this.state.selectedChart===type}
                isAvailable={currentlyAvailableCharts[type]} />
            </Col>
              
          ))
        }
      </Row>
    );
  }

  render() {
    const availableCharts = this.getAvailableCharts();

    /*
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
    */


    const controlButtons = (
      <div style={{ position: 'absolute', bottom: 0, left: 10 }}>
        <Button
          onClick={() => alert('hi')}
        >
            <SaveIcon size={12} />
        </Button>
        <Button
          type='danger'
          onClick={() => window.location.reload()}>
            <Trash2Icon size={12}/>
        </Button>
      </div>
    );


    return (
      <div className="app">
        <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
          <Row around="xs">
            <Col xs={2}>
              <div className="center">
                <ListIcon size={12} />{' '}<small><b>Fields</b></small>
              </div>
              <hr />
              <Droppable droppableId="fields">
                {(provided, snapshot) => (
                  <div
                    className="droppable-facet"
                    ref={provided.innerRef}
                    style={{ border: 'none', height: '100%', padding: 5, paddingRight: 30, }}
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
                            <Field {...item} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
            <Col xs={2}>
              <div className="center">
                <LayersIcon size={12} />{' '}<small><b>Layers</b></small>
              </div>
              <hr />
              <DroppableFacet
                name="Color"
                item={this.state.selectedColor}
                onClickX={() => this.setState({ selectedColor: {} })}
                placeholder={droppablePlaceholder}
                style={{ borderColor: this.state.isDragging && 'coral' }}
              />
              <br />
              <DroppableFacet
                name="Shape"
                item={this.state.selectedShape}
                onClickX={() => this.setState({ selectedShape: {} })}
                placeholder={droppablePlaceholder}
                style={{ borderColor: this.state.isDragging && 'coral' }}
              />
              <br />
              <DroppableFacet
                name="Size"
                item={this.state.selectedSize}
                onClickX={() => this.setState({ selectedSize: {} })}
                placeholder={droppablePlaceholder}
                style={{ borderColor: this.state.isDragging && 'coral' }}
              />
              <br />
              <br />
              <div className="center">
                <BarChart2Icon size={12} />{' '}<small><b>Chart Types</b></small>
              </div>
              <hr />
              {availableCharts}
            </Col>
            <Col xs={7}>
              <Row middle="xs" style={{ marginBottom: 4 }}>
                <Col style={{ width: 50 }}>
                  <small><b>Columns</b></small>
                </Col>
                <Col xs={10}>
                  <Droppable droppableId="columns" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        className="card droppable-facet"
                        ref={provided.innerRef}
                        style={{ borderColor: this.state.isDragging && 'coral' }}>
                        {this.state.columns.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}>
                            {(provided, snapshot) => (
                              <AggregateableField
                                name={item.content}
                                type={item.type}
                                provided={provided}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style,
                                  true)}
                              >
                                {item.content}
                                {' '}
                                <span onClick={() => this.removeField('columns', item.id)} style={{ color: 'red', cursor: 'pointer' }}>{'×'}</span>
                              </AggregateableField>
                            )}
                          </Draggable>
                        ))}
                        {this.state.columns.length===0 && droppablePlaceholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              </Row>
              <Row middle="xs">
                <Col style={{ width: 50 }}>
                  <small><b>{'Rows'}{'   '}</b></small>
                </Col>
                <Col xs={10}>
                  <Droppable droppableId="rows" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        className="card droppable-facet"
                        ref={provided.innerRef}
                        style={{ borderColor: this.state.isDragging && 'coral' }}>
                        {this.state.rows.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}>
                            {(provided, snapshot) => (
                              <AggregateableField
                                name={item.content}
                                type={item.type}
                                provided={provided}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style,
                                  true)}
                              >
                                {item.content}
                                {' '}
                                <span onClick={() => this.removeField('rows', item.id)} style={{ color: 'red', cursor: 'pointer' }}>{'×'}</span>
                              </AggregateableField>
                            )}
                          </Draggable>
                        ))}
                        {this.state.rows.length===0 && droppablePlaceholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              </Row>
              <br />
              {this.renderChart(this.props.data)}
            </Col>
          </Row>
        </DragDropContext>
        {controlButtons}
      </div>
    );
  }
}

export default App;
