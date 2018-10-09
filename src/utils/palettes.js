import palette from 'google-palette';
import { scaleLinear } from 'd3';
import  { interpolateSpectral } from 'd3-scale-chromatic';

function* categorical(n) {
  for (let i=0; i<n; i++) {
    yield '#' + palette('rainbow', n)[i % n];
  }
  return 'salmon';
}

function numerical(low, high) {
  return (x) => {
    var xScaled = scaleLinear()
      .domain([low, high])
      .range([0, 1])(x);
    return interpolateSpectral(xScaled);
  }
}

export default {
  categorical,
  numerical,
}
