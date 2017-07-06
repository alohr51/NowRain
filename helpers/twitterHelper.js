var Twitter = require('twitter');
var cfenv = require("cfenv");

var appEnv = cfenv.getAppEnv();

var twitterCreds = appEnv.getService("nowRainTwitter");

var consumerKey = twitterCreds.credentials.consumerKey;
var consumerSecret = twitterCreds.credentials.consumerSecret;
var accessToken = twitterCreds.credentials.accessToken;
var accessTokenSecret = twitterCreds.credentials.accessTokenSecret;


var client = new Twitter({
	consumer_key: consumerKey,
	consumer_secret: consumerSecret,
	access_token_key: accessToken,
	access_token_secret: accessTokenSecret
});

exports.tweet = function(tweetMsg, callback){

	client.post('statuses/update', {status: tweetMsg}, function(error, tweet, response){
		if (!error) {
			callback(null,tweet);
		}
		else{
			callback('Error tweeting: ' + error, null);
		}
	});
};