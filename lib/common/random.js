const UNMISTAKABLE_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';
// const BASE64_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
const secureRandom = require('secure-random');
const _ = require('underscore');

const Random = {
  byteArray(size = 1, max = 255) {
    const numbers = secureRandom.randomArray(size);
    return _.map(numbers, (n) => Math.floor((n * max) / 255));
  },
  chars(size = 1) {
    const bytes = this.byteArray(size, UNMISTAKABLE_CHARS.length - 1);
    return _.map(bytes, (n) => UNMISTAKABLE_CHARS[n]).join('');
  },
};

module.exports = Random;
