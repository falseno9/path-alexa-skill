var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = 'mongodb://localhost:27017/gtfs';
var fs = require('fs');
var Promise = require('bluebird');
var stop_metadata = require('../src/data/stop_metadata');
var lodash = require('lodash');

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
        temp[stop_metadata[stop.stop_id]] = stop.arrival_time;
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
      db.close();
      return tripsInfo;
    })
}

MongoClient.connect(url)
  .then(db => {
    return getTripsInfoPerRoute(process.env.ROUTE_ENV, db);
  })
  .then(output => {
    let finalOutput = {};
    finalOutput.stops = [];
    finalOutput.up = [];
    finalOutput.down = [];
    output.forEach(res => {
      var stops = 
        lodash.flatten(
          lodash.reduce(res.stops, function(result, value, key){ result.push(Object.keys(value)); return result;}, [])
        );
      lodash.merge(finalOutput.stops, stops);
      if(res.direction === 'World Trade Center') {
        finalOutput.down.push(res.stops);
      } else {
        finalOutput.up.push(res.stops);
      }
    });
    // If filename is specified write to the file, else console log
    if (process.env.FILENAME) {
      fs.writeFile(process.env.FILENAME, JSON.stringify(finalOutput, null, 2), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
      });
    } else {
      console.log(JSON.stringify(finalOutput, null, 2));
    }
  })
  .catch(e => {
    console.log(e)
  })
