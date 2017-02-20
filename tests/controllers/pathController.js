'use strict';

const expect = require('chai').expect;
const pathController = require('../../controllers/pathController');

const routeStopDetails = require('../../resources/route_860');

describe('pathController', () => {
  describe('#findNextTime', () => {

  });

  describe('#processRoute', () => {

  });

  describe('#getRouteTime', () => {
    it('should return correct data for today', () => {
      const thisTime = new Date('2016-02-19 20:23:00');
      const output = pathController.getRouteTime(
          'Newport', 
          'Exchange Place',
          routeStopDetails.down,
          thisTime);

      expect(output).to.deep.equal({
        time: '20:24:00',
        isToday: true
      })
    });

    it('should return correct data for tomorrow', () => {
      const thisTime = new Date('2016-02-19 23:59:00');
      const output = pathController.getRouteTime(
          'Newport', 
          'Exchange Place',
          routeStopDetails.down,
          thisTime);

      expect(output).to.deep.equal({
        time: '06:17:00',
        isToday: false
      })
    });
  });
});