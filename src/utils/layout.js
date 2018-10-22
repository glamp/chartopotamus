import _ from 'lodash';
import Combinatorics from 'js-combinatorics';

export const calculateLayout = ({ rows, columns, data, }) => {
  const categoricalRows = _.map(_.filter(rows, x => x.type==='categorical'), 'content');
  const categoricalColumns = _.map(_.filter(columns, x => x.type==='categorical'), 'content');

  const rowFields = categoricalRows.map(field => {
    return { field, values: _.map(_.uniqBy(data, field), field).sort() };
  });
  const columnFields = categoricalColumns.map(field => {
    return { field, values: _.map(_.uniqBy(data, field), field).sort() };
  });


  const pickers = _.map(rowFields, 'field').concat(_.map(columnFields, 'field'));
  
  let groupedData = _.groupBy(data, row => {
    const key = _.pick(row, pickers);
    return JSON.stringify(key);
    return _.values(key).join(', ');
  });
  
  if (rowFields.length && columnFields.length) {
    Combinatorics.cartesianProduct(rowFields[0].values, columnFields[0].values)
      .toArray().map(combo => {
        const key = JSON.stringify({
          [rowFields[0].field]: combo[0],
          [columnFields[0].field]: combo[1]
        });
        groupedData[key] = groupedData[key] || [];
      });
  }


  let grid = {};
  grid.rows = rowFields.length===0 ? 1 : rowFields[0].values.length;
  grid.columns = columnFields.length===0 ? 1 : columnFields[0].values.length;

  const chartData = _.toPairs(groupedData).map((group, idx) => {
    const name = JSON.parse(group[0]);
    const subset = group[1];

    const yAxis = rowFields.length===0 ? 1 : rowFields[0].values.indexOf(name[rowFields[0].field]) + 1;
    const xAxis = columnFields.length===0 ? 1 : columnFields[0].values.indexOf(name[columnFields[0].field]) + 1;

    return {
      name: _.values(name).join(', '),
      x: _.map(subset, 'carat'),
      y: _.map(subset, 'price'),
      type: 'scatter',
      mode: 'markers',
      xaxis: `x${xAxis}`,
      yaxis: `y${yAxis}`,
    };
  });

  return {
    layout: {
      autosize: false,
      width: 800,
      height: 800,
      grid
    },
    data: chartData,
    rowFields,
    columnFields,
  }
}
