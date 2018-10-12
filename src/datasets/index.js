import meat from './meat.json';
import diamonds from './diamonds-1k.json';
import iris from './iris.json';
import pigeons from './pigeons.json';

import moment from 'moment';

export default {
  diamonds,
  meat: meat.map(x => {
    x.date = moment(x.date).toDate();
    return x;
  }),
  iris,
  pigeons
};
