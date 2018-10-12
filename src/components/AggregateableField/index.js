import React from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import './react-contextmenu.css';


export default class ColumnField extends React.Component {

  render() {
    const { provided, style } = this.props;
    return (
      <span
        className="field"
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={style}>
        {this.props.children}
      </span>
    );
    // TODO: unveil when you have a plan!
    return (
      <div>
        <ContextMenuTrigger id="some_unique_identifier">
          <span
            className="field"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={style}>
            {this.props.children}
          </span>
        </ContextMenuTrigger>
        <ContextMenu id="some_unique_identifier">
          <MenuItem onClick={() => alert('hi!')}>
            <i>mean</i>{' '}({this.props.name})
          </MenuItem>
          <MenuItem onClick={() => alert('hi!')}>
            <i>sum</i>{' '}({this.props.name})
          </MenuItem>
          <MenuItem onClick={() => alert('hi!')}>
            <i>min</i>{' '}({this.props.name})
          </MenuItem>
        </ContextMenu>
      </div>
    );
  }
}
