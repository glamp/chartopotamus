import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import _ from 'lodash';
import { formatValue } from '../../utils/format';
import './index.css';

const mean = (array) => {
  if (_.isNumber(array[0])) {
    return _.round(_.mean(array), 4);
  }
  return array[Math.floor(array.length * 0.5)];
}

const getStatistics = (array) => {
  if (_.isNumber(array[0]) || _.isDate(array[0])) {
    array.sort();
    let stats = [
      ['Min', _.min(array)],
      ['25%', array[Math.floor(array.length * 0.25)]],
      ['Mean', mean(array)],
      ['Median', array[Math.floor(array.length * 0.5)]],
      ['75%', array[Math.floor(array.length * 0.75 )]],
      ['Max', _.max(array)],
    ]
    return (
      <div>
      {
        stats.map(stat => (
          <Row>
            <Col xs={6}>
              <small>{stat[0]}</small>
            </Col>
            <Col xs={6}>
              <small>{formatValue(stat[1])}</small>
            </Col>
          </Row>
        ))
      }
      </div>
    );
  }


  let frequencies = _.toPairs(_.countBy(array, x => x));
  frequencies = _.sortBy(frequencies, x => -x[1]);
  let other = [];
  if (frequencies.length > 5) {
    other = [
      'other',
      _.sumBy(frequencies.slice(5), x => x[1])
    ];
    frequencies = frequencies.slice(0, 5).concat([other]);
  }

  return (
    <div>
    {
      frequencies.map(freq => (
        <Row>
          <Col xs={6}>
            <small>{freq[0]}</small>
          </Col>
          <Col xs={6}>
            <small>{freq[1]}</small>
          </Col>
        </Row>
      ))
    }
    </div>
  );
}

export default ({ data }) => {
  const columns = _.keys(data[0]);
  return (
    <Row>
      {
        columns.map(column => (
          <Col xs={3}>
            <div className="summary-grid">
              <div className="summary-grid-header">{column}</div>
              {getStatistics(_.map(data, column))}
            </div>
          </Col>
        ))
      }
    </Row>
  );
};
