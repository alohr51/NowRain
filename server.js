var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

console.log('App started on ' + appEnv.bind + ':' + appEnv.port);
app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({ extended: true }));

// Configure views
var path = require('path');
app.use(express.static(path.join(__dirname, 'views')));

require("./routes/routes.js")(app);
http.listen(appEnv.port, appEnv.bind);