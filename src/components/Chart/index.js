import React from 'react';
import Plot from 'react-plotly.js';

export default ({ data }) => {
  let layout = { showLegend: true };
  if (data.length > 1 && data[0].type==='bar') {
    layout.barmode = 'group';
  }
  return (
    <Plot
        data={data}
        layout={layout}
        config={{ displayModeBar: false }}
      />
  );
}
