var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = 'mongodb://localhost:27017/gtfs';
var fs = require('fs');
var Promise = require('bluebird');

function getStopTimesPerTrip(tripId, db) {
  const stopsInfo = [];
  var stopTimes = db.collection('stoptimes');
  return stopTimes
    .find({
      trip_id: tripId,
    })
    .toArray()
    .then(allStops => {
      allStops.forEach(stop => {
        const temp = {};
        temp[stop.stop_id] = stop.arrival_time;
        stopsInfo.push(temp);
      });
      return stopsInfo;
    });
}

function getTripsInfoPerRoute(routeId, db) {
  const tripsInfo = [];
  var trips = db.collection('trips');

  return trips
    .find({
      route_id: routeId
    })
    .toArray()
    .then(allTrips => {
      const pStack = [];
      allTrips.forEach(oneTrip => {
        const temp = {};
        temp.tripId = oneTrip.trip_id;
        temp.direction = oneTrip.trip_headsign;
        tripsInfo.push(temp);
        pStack.push(getStopTimesPerTrip(temp.tripId, db));
      });
      return Promise.all(pStack);
    })
    .then(result => {
      var i = 0;
      result.forEach(stop => {
        tripsInfo[i].stops = stop;
        i++;
      });
      return tripsInfo;
    })
}

MongoClient.connect(url)
  .then(db => {
    //console.log(db)
    return getTripsInfoPerRoute("860", db);
  })
  .then(output => {
    console.log(JSON.stringify(output, null, 2));
    // Process the data
  })
  .catch(e => {
   // console.log(e)
  })