module.exports = function (app) {
	var checkWeather = require('../helpers/checkWeather.js');

	//Timer to check weather every 4 min.
	setInterval(function(){
		checkWeather.checkForRain();
	}, 4 * 60 * 1000);

	app.get('/', function(req, res) {
		res.render('index.html');
	});

	//used to manually test.
	app.get('/w', function(req, res) {
		checkWeather.checkForRain();
		res.send('ok');
	});
};