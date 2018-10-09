import React, { Component } from 'react';
import './charticon.css';

const icons = {
  histogram: require('./histogram.svg'),
  bar: require('./bar.svg'),
  horizontalbar: require('./horizontal-bar.svg'),
  line: require('./line.svg'),
  scatter: require('./scatter.svg'),
  table: require('./table.svg')
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
      return "chart-icon center onhover";
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
