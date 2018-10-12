import React, { Component } from 'react';
import './index.css';

const icons = {
  histogram: require('./histogram.ico'),
  bar: require('./bar.ico'),
  horizontalbar: require('./horizontalbar.ico'),
  line: require('./line.ico'),
  scatter: require('./scatter.ico'),
  lineandscatter: require('./lineandscatter.ico'),
  table: require('./table.ico'),
  summary: require('./summary.ico'),
}


export default class ChartIcon extends Component {

  handleClick = () => {
    if (this.props.isAvailable) {
      if (this.props.onClick) {
        this.props.onClick();
      }
    }
  }

  getClass() {
    if (this.props.isSelected) {
      return "chart-icon center selected";
    }
    if (this.props.isAvailable) {
      return "chart-icon center is-available";
    } else {
      return "chart-icon center unavailable";
    }
  }
  render() {
    var icon = <img alt="chart icon" className="icon" src={icons[this.props.type.toLowerCase()]} />
    return (
      <div onClick={this.handleClick} className={this.getClass()}>
        {icon}
        <div className="center"><small>{this.props.type.toLowerCase()}</small></div>
      </div>
    );
  }
}
