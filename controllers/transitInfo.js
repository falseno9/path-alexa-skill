'use strict';

const request = require('supertest-as-promised');
const moment = require('moment');
const lodash = require('lodash');
const handlebars = require('handlebars');
const API_KEY = process.env.API_KEY;
//https://maps.googleapis.com/maps/api/directions/json?origin=Grove%20Street&destination=Journal%20Square&departure_time=1487624934&mode=transit&key=key

const responseTemplate = 'Take {{trainHeadSign}} at {{trainDepartureTime}} from {{source}} to {{destination}}';
const template = handlebars.compile(responseTemplate);

const url = 'https://maps.googleapis.com';
const path = '/maps/api/directions/json';

function getDataFromAPI(source, destination, departureTime, key) {
  const query = {
    origin: source,
    destination: destination,
    //departureTime: departureTime,
    mode: 'transit',
    transit_mode: 'rail',
    key:  API_KEY   
  };
  console.log(`Requesting GAPI to get data for: ${JSON.stringify(query, null, 2)}`);
  return request(url)
    .get(path)
    .query(query)
    .expect(200)
    .then(response => {
      console.log(response.body)
      return response.body;
    })
    .catch(e => {
      console.log(e)
      console.log(`Error encountered from API ${JSON.stringify(e, null, 2)}`);
      return false;
    });
}

function processData(data) {
  const transitRoutes = lodash.filter(data.routes[0].legs[0].steps, ['travel_mode', 'TRANSIT']);
  
  const response = [];
  transitRoutes.forEach(item => {
    const temp = {};
    temp.trainHeadSign = item.html_instructions;
    temp.trainDepartureTime = item.transit_details.departure_time.text;
    temp.source = item.transit_details.departure_stop.name;
    temp.destination = item.transit_details.arrival_stop.name;
    const parsedResult = template(temp);
    response.push(parsedResult);
  });
  return response;
}

function getNextTrain(origSource, origDestination) {
  const departureTime = moment.valueOf();
  console.log(`Retrieving data from ${origSource} to ${origDestination}`);
  // Append words 'path station' to source and destination for accurate results
  const source = lodash.includes(origSource, 'path') ? origSource : `${origSource} path station`;
  const destination = lodash.includes(origDestination, 'path') ? origDestination : `${origDestination} path station`;
  return getDataFromAPI(source, destination, departureTime)
    .then(result => {
      if (!result) {
        return {
          isError: true,
          data: `Error obtaining PATH information from ${origSource} to ${origDestination}`
        };
      } else {
        if (result.status !== 'OK') {
          return {
            isError: true,
            data: `Error obtaining PATH information from ${origSource} to ${origDestination}`
          };          
        } else {
          const response = processData(result);
          if (response.length == 0 ) {
            return {
              isError: true,
              data: `Path information not found for ${origSource} to ${origDestination}`
            };
          }
          else if (response.length > 1) {
            return {
              isError: false,
              data: `This route has transfers. ${response}`
            };
          } else {
            return {
              isError: false,
              data: `${response}`
            };
          }
        }
      }
    });
}

module.exports = {
  getDataFromAPI,
  getNextTrain,
  processData
}
