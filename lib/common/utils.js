// const humanizePrefix = ['k', 'm', 'b'];
const { ObjectId } = require('mongoose').Types;
const moment = require('moment');

module.exports = {
  sanitizeForMDB(value, type = 'string') {
    switch (type) {
      case 'string': value = (value !== undefined && value !== null) ? value.toString() : value;
        break;
      case 'integer': value = parseInt(value, 10);
        break;
      default:
        value = value.toString();
    }
    return value;
  },
  humanize(number) {
    // show '-' if number isn't a real number
    if (_.isString(number)) { number = parseInt(number, 10); }
    if (!_.isNumber(number) || _.isNaN(number)) { return '-'; }

    // in case we have float number
    number = Math.floor(number);

    return _.numberFormat(number);

    // return _(humanizePrefix).reduce((memo, prefix) => {
    //   if (memo.number < 1000) return memo;
    //   memo.number /= 1000;
    //   memo.result = `${memo.number.toFixed(1)}${prefix}`;
    //   return memo;
    // }, { number, result: number }).result;
  },
  niceDate(date, type) {
    switch (type) {
      default:
        return moment(date).format('YYYY-MM-DD');
    }
  },
  toObjectIds(vals) {
    if (_.isString(vals)) return new ObjectId(vals);
    if (_.isArray(vals)) {
      return _(vals).map((str) => new ObjectId(str));
    }
    return null;
  },
  toHash(objArr, keyName) {
    return _(objArr).reduce((memo, obj) => {
      memo[_.getPath(obj, keyName)] = obj;
      return memo;
    }, []);
  },
};
