'use strict';
const expect = require('chai').expect;
const transitInfo = require('../../controllers/transitInfo');

describe('transitInfo', () => {
  describe('#getNextTrain', () => {
    it.only('should work', () => {
     return transitInfo.getNextTrain(
        'hoboken', 
        'world trade center',
        process.env.API_KEY)
        .then(output => {
          // console.log(output);
          expect(output.isError).to.be.false;
        });
    });
  });
});