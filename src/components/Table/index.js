import React from 'react';
import _ from 'lodash';
import { formatValue } from '../../utils/format';
import './index.css';


export default ({ data }) => {
  const columns = _.keys(data[0]);
  return (
    <div>
      <table className="table">
        <thead>
          <tr>
          {
            columns.map(col => <th>{col}</th>)
          }
          </tr>
        </thead>
        <tbody>
          {
            data.slice(0, 25).map(row => (
              <tr>
                {columns.map(col => <td>{formatValue(row[col])}</td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};
