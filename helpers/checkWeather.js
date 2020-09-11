var request = require("request");
// npm install cities --save
//var cities = require('cities');
var cloudant = require('../helpers/cloudantHelper.js');
var twitter = require('../helpers/twitterHelper.js');
var text = require('../helpers/textHelper.js');
var moment = require('moment-timezone');
var cfenv = require("cfenv");

var appEnv = cfenv.getAppEnv();

var weatherCreds = appEnv.getService("nowRainWeather");
var weatherURL = weatherCreds.credentials.url;

// only durham for now
exports.checkForRain = function(){
	cloudant.getAllDocs(function (err,locations){
		if(err){
			console.log('Error in checkForRain() - getting all docs from Cloudant. ' + err)
		}
		else{
			for(var i=0; i < locations.total_rows; i++){
				getWeatherAndCheckRain(locations.rows[i].doc);
			}
		}
	});
};

function getWeatherAndCheckRain(locationDoc) {
	var city = locationDoc.city;
	var zip = locationDoc._id;
	var rev= locationDoc._rev;
	var state = locationDoc.state;
	var lat = locationDoc.lat;
	var long = locationDoc.long;
	var previouslyRaining = locationDoc.previouslyRaining;

	var endpoint = '/api/weather/v2/observations/current';
	var query = '?units=e&geocode='+lat+'%2C'+long+'&language=en-US';

	request(weatherURL + endpoint + query, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var weatherModel = JSON.parse(body);
			var currWeather = weatherModel.observation.phrase_32char.toLowerCase();
			var currTemp = weatherModel.observation.imperial.temp;
			var timestamp = moment().tz("America/New_York").format('MMMM Do YYYY, h:mm a');
			if(!previouslyRaining && currWeather.indexOf('rain') > -1 || currWeather.indexOf('showers') > -1) {
				console.log('----------------------------------------------------------\n' +
					timestamp + '\n' +
					'It started raining in: ' + city +', ' + state + ' - ' + zip + '\n' +
					'\npreviouslyRaining is: '+ previouslyRaining +
					'\nCurrent Weather is: ' + currWeather + '\nCurrent temp is: ' + currTemp + 'F\n' +
					'----------------------------------------------------------');
				previouslyRaining = true;

				// update cloudant doc
				var newDoc = {'_id':zip,'_rev':rev,'previouslyRaining':previouslyRaining,'lat':lat,'long':long,'city':city,'state':state};
				cloudant.insert(newDoc, function(err, msg){
					if(!err)console.log('successfully updated doc: ' + zip);
					else console.log('error updating doc: ' + zip + " - " + JSON.stringify(err));
				});
				var messageToConsumers = 'It started to rain! Current Temp: ' + currTemp + '°F';
				// Tweet it!
				// This is hard coded because the app is not multi-tenant yet...
				if(zip === '27713') {
					twitter.tweet(messageToConsumers, function (err, msg) {
						if (!err)console.log("Tweeted: " + msg.text);
						else console.log(JSON.stringify(err));
					});
				}
			}
			else if(previouslyRaining && currWeather.indexOf('rain') == -1 && currWeather.indexOf('showers') == -1){
				console.log('----------------------------------------------------------\n' +
					timestamp + '\n' +
					'It stopped raining in: ' + city +', ' + state + ' - ' + zip + '\n' +
					'\npreviouslyRaining is: '+ previouslyRaining +
					'\nCurrent Weather is: ' + currWeather + '\nCurrent temp is: ' + currTemp + 'F\n' +
					'----------------------------------------------------------');
				previouslyRaining = false;
				// update cloudant doc
				var newDoc = {'_id':zip,'_rev':rev,'previouslyRaining':previouslyRaining,'lat':lat,'long':long,'city':city,'state':state};
				cloudant.insert(newDoc, function(err, msg){
					if(!err)console.log('successfully updated doc: ' + zip);
					else console.log('error updating doc: ' + zip + " - " + JSON.stringify(err));
				});
				var messageToConsumers = 'It stopped raining! Current Temp: ' + currTemp + '°F';
				// Tweet it!
				if(zip === '27713') {
					twitter.tweet(messageToConsumers, function (err, msg) {
						if (!err)console.log("Tweeted: " + msg.text);
						else console.log(JSON.stringify(err));
					});
				}
			}
			else{
				console.log('----------------------------------------------------------\n' +
					 timestamp + '\n' +
					'Doing nothing for: ' + city +', ' + state + ' - ' + zip + '\n' +
					'because it did not start or stop raining. \npreviouslyRaining is: '+ previouslyRaining +
					'\nCurrent Weather is: ' + currWeather + '\nCurrent temp is: ' + currTemp + 'F\n' +
					'----------------------------------------------------------');
			}
		}
		else{
			console.log('Error requesting weather data: ' + error);
		}
	})
}

//Saved for adding cities later in life.
//var cities = require('cities');
//Lookup by GPS coordinates
//cities.gps_lookup(lat, lng);
//Lookup by zipcode
//cities.zip_lookup(zipcode);
//Lookup by state
//cities.findByState('NJ')
//Sample Response
//A sample response or object that this module returns looks like this.
//
//{
//    zipcode: "07452",
//    state_abbr: "NJ",
//    latitude: "111111",
//    longitude: "111111",
//    city: "glen rock",
//    state: "New Jersey"
//}
