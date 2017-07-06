//***** Not using texting feature anymore******
//
//var cfenv = require("cfenv");
//var appEnv = cfenv.getAppEnv();
//var twilioCreds = appEnv.getService("Twilio-2y");
//
//var ssid = twilioCreds.credentials.accountSID;
//var authToken = twilioCreds.credentials.authToken;
//
//var client = require('twilio')(ssid, authToken);
//
// exports.sendText = function(to, msg){
// 	client.sendMessage({
// 		to: to,
// 		from: '+1',
// 		body: msg
// 	}, function(err, responseData) {
// 		if (!err) {
// 			console.log('Sent text to: ' + responseData.to + ' with msg: ' + responseData.body);
// 		}
// 		else{
// 			console.log('Error sending text message: ' + JSON.stringify(err));
// 		}
// 	});
// }