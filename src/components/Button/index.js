import React from 'react';
import { bouncy } from './Bouncy';
import './index.css';

export default class Button extends React.Component {
  render() {
    let style = this.props.style || {};
    if (this.props.animated) {
      style.animation = `${bouncy} 10s infinite linear`
      style.position = 'relative';
      style.animationDelay = `${this.props.animationDelay || 0}s`;
    }

    let klass = ['button'];
    if (this.props.type==='danger') {
      klass.push('danger');
    }

    return (
      <button
        className={klass.join(' ')}
        onClick={() => this.props.onClick && this.props.onClick()}
        style={style}
        >{this.props.children}</button>
    )
  }
}
