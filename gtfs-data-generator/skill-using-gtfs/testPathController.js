'use strict';

const expect = require('chai').expect;
const pathController = require('../../controllers/pathController');

const routeStopDetails = require('../../resources/route_860');

describe('pathController', () => {
  describe('#findNextTime', () => {
    it('should return correct data', () => {
      const output = pathController.findNextTime('newport', 'exchange place');
      expect(output).to.have.all.keys('hours', 'minutes', 'isToday');
    });
  });

  describe('#processRoute', () => {

  });

  describe('#getRouteTime', () => {
    it('should return correct data for today', () => {
      const thisTime = new Date('2016-02-19 20:23:00');
      const output = pathController.getRouteTime(
          'newport', 
          'exchange place',
          routeStopDetails.down,
          thisTime);

      expect(output).to.deep.equal({
        hours: '20',
        minutes: '24',
        isToday: true
      })
    });

    it('should return correct data for tomorrow', () => {
      const thisTime = new Date('2016-02-19 23:59:00');
      const output = pathController.getRouteTime(
          'newport', 
          'exchange place',
          routeStopDetails.down,
          thisTime);

      expect(output).to.deep.equal({
        hours: '06',
        minutes: '17',
        isToday: false
      })
    });
  });
});