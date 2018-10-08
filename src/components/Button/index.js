import React from 'react';
import './index.css';

export default class Button extends React.Component {
  render() {
    return (
      <button className="button" onClick={() => this.props.onClick && this.props.onClick()}>{this.props.children}</button>
    )
  }
}
