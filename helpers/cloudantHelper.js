var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();
var Cloudant = require('cloudant');

var appEnv = cfenv.getAppEnv();

var cloudantCreds = appEnv.getService("nowRainCloudant");
var cloudantUser = cloudantCreds.credentials.username;
var cloudantPass = cloudantCreds.credentials.password;

//init cloudant
var cloudant = Cloudant({account:cloudantUser, password:cloudantPass});
var locationsDB = cloudant.db.use('locations');

exports.insert = function(doc, callback){
	locationsDB.insert(doc, function(err, body, header) {
		if (err) {
			console.log("Error inserting new doc: " + err);
			callback('Error inserting new doc', null);
		}
		else{
			callback(null, 'ok');
		}
	});

}

exports.get = function (docName, callback){
	locationsDB.get(docName, function(err, doc) {
		if(err){
			console.log('Error getting ' + docName + ' from Cloudant. ' + err)
			return callback('Error getting ' + docName + ' from Cloudant.');
		}
		else{
			return callback(null, doc);
		}
	});
}

exports.getAllDocs = function (callback){
	locationsDB.list({include_docs:true}, function(err, doc) {
		if(err){
			console.log('Error getting all docs from Cloudant. ' + err)
			return callback('Error getting all docs from Cloudant.');
		}
		else{
			return callback(null, doc);
		}
	});
}