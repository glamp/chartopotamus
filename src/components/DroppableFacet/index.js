import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';

export default ({ name, item, onClickX }) => (
  <Row>
    <Col xs={12}>
      <small>{name}</small>
      <Droppable droppableId={`selected${name}`} direction="horizontal">
        {(provided, snapshot) => (
          <div
            className="card droppable-facet"
            ref={provided.innerRef}
            >
            {
              _.isEmpty(item) ? (
                <div className="empty-field"></div>
              ) : (
                <Draggable
                  key={`${name}-${item.id}`}
                  draggableId={`${name}-${item.id}`}
                  index={0}>
                  {(provided, snapshot) => (
                    <div
                      className="field"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      >
                      {item.content}
                      {' '}
                      <span onClick={onClickX} style={{ cursor: 'pointer', color: 'red' }}>{'×'}</span>
                    </div>
                  )}
                </Draggable>
              )
            }
          </div>
        )}
      </Droppable>
    </Col>
  </Row>
)
