'use strict';
const expect = require('chai').expect;
const transitInfo = require('../../controllers/transitInfo');

describe('transitInfo', () => {
  describe('#getNextTrain', () => {
    it.only('should work', () => {
     return transitInfo.getNextTrain(
        'harrison', 
        'new port',
        process.env.API_KEY)
        .then(output => {
          console.log(JSON.stringify(output, null, 2));
          expect(output.isError).to.be.false;
        });
    });
  });
});