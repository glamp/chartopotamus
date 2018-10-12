import moment from 'moment';
import _ from 'lodash';

export const formatValue = (value) => {
  if (_.isNil(value)) {
    return '---';
  }

  if (_.isDate(value)) {
    return moment(value).format('YYYY-MM-DD');
  }

  return value;
}
