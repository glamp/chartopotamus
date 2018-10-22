# chartopotamus

### TODO
- [x] icons for chart types
- [ ] bug on reordering Columns
- [ ] bar charts not working
- [ ] row/columns not really doing as expected

### Bonus 
- [ ] calculated fields / aggregations
- [ ] immutable?
- [ ] performance



if there is only 1 numeric dimension and 1 categorical dimension:
  - plot normally

if there is only 1 numeric dimension and multiple categorical dimensions:
  if numeric is in rows:
    - calculate # of rows
    - plot column categorical vs. numeric

  if numeric is in columns:
    - calculate # of columns
    - plot row categorical vs. numeric

if there are 2 numeric dimensions to plot:
  - calculate # of rows (n)
  - calculate # of columns (m)
  - n x m subplots

if there are >2 numeric dimensions
  - calculate # of rows (n)
  - calculate # of columns (m)
  - n x m subplots
  - within each subplot:
    subplot for each numeric combo
