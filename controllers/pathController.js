'use strict'

const routeMetadata = require('../resources/route_metadata');
const _ = require('lodash');
const moment = require('moment');

function findNextTime(source, destination) {
  const routeFound = lodash.filter(test,
    (o) => {
      return _.includes(o.route_stops, source) && _.includes(o.route_stops, destination)
    });

  // Direct path found
  if (routeFound.length !== 0) {
    return processRoute(source, destination, routeFound);
  }
};

function processRoute(source, destination, routeObject) {
  const routeStopDetails = require(`../resources/${routeFound.route_name}`);

  return _.indexOf(routeObject.route_stops, source) < _.indexOf(routeObject.route_stops, destination) ?
    getRouteTime(source, destination, routeStopDetails.down) :
    getRouteTime(source, destination, routeStopDetails.up);
};

function getRouteTime(source, destination, routeStopDetails) {
  const currTime = moment().format("HH:mm:ss");
  routeStopDetails = _.sortBy(routeStopDetails, [routeStopDetails[source]]);
  const timeObject = _.filter(routeStopDetails, (o) => {
    return o[source] > currTime;
  });

  const returnObject = {};
  if (timeObject.length !== 0) {
    returnObject.time = timeObject[0][source];
    returnObject.isToday = true;
  } else {
    returnObject.time = routeStopDetails[0][source];
    returnObject.isToday = false;
  }

  return returnObject;
};