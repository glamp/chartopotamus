# tablue

d3 histogram
```
var bins = histogram(data);
var histogram = d3.histogram()
    .value(function(d) { return d.date; })
    .domain(x.domain())
    .thresholds(x.ticks(d3.timeMonth));
```
