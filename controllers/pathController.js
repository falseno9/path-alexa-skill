'use strict'

const routeMetadata = require('../resources/route_metadata');
const _ = require('lodash');
const moment = require('moment');

function findNextTime(source, destination) {
  console.log(`Finding next time from ${source} to ${destination}`);
  console.log(`Route metadata: ${JSON.stringify(routeMetadata, null, 2)}`);
  const routeFound = _.find(routeMetadata,
    (o) => {
      return (_.includes(o.route_stops, source) && _.includes(o.route_stops, destination));
    });

  console.log(`Route found: ${JSON.stringify(routeFound, null, 2)}`);
  // Direct path found
  if (routeFound.length !== 0) {
    return processRoute(source, destination, routeFound);
  }
};

function processRoute(source, destination, routeObject) {
  const routeStopDetails = require(`../resources/${routeObject.route_name}`);

  _.indexOf(routeObject.route_stops, source) < _.indexOf(routeObject.route_stops, destination) ?
  console.log('Down direction') :
  console.log('Up direction');

  return _.indexOf(routeObject.route_stops, source) < _.indexOf(routeObject.route_stops, destination) ?
    getRouteTime(source, destination, routeStopDetails.down) :
    getRouteTime(source, destination, routeStopDetails.up);
};

function getRouteTime(source, destination, routeStopDetails, thisTime) {
  const formatString = 'HH:mm:ss';
  const currTime = moment(thisTime).format(formatString) || moment().format(formatString);
  console.log(`Current time is ${currTime}`);
  const sortedRouteStopDetails = _.sortBy(routeStopDetails, (o) => {
    return o[source];
  });

  const timeObject = _.filter(sortedRouteStopDetails, (o) => {
    return o[source] > currTime;
  });

  const returnObject = {};
  if (timeObject.length !== 0) {
    let splitTime = _.split(timeObject[0][source], ':', 2);
    returnObject.hours = splitTime[0];
    returnObject.minutes = splitTime[1];
    returnObject.isToday = true;
  } else {
    let splitTime = _.split(sortedRouteStopDetails[0][source], ':', 2);
    returnObject.hours = splitTime[0];
    returnObject.minutes = splitTime[1];
    returnObject.isToday = false;
  }

  return returnObject;
};

module.exports = {
  getRouteTime,
  findNextTime
}