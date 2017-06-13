/* eslint-disable */
const { expect } = require('chai');
describe('User', () => {
  it('expect return -1 when the value is not present', () => {
    expect([1,2,3].indexOf(4)).to.equal(-1);
  });
});