/**
 * Created by vikoltun on 14/11/2014.
 */

var express = require('express');
var request = require('request');
// import the modules necessary for scraping
var cheerio = require('cheerio');
//logging
var winston = require('winston');
var async = require('async');

//database
// this part is for OpenShift deployment
var morgan  = require('morgan');
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var weatherAPI = null;
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) {
      console.log('mongoURL is null');
      return;
    }
  
  var mongodb = require('mongodb');
  if (mongodb == null) {
      console.log('No mongobd got via "require(mongodb)"');
      return;
    }

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    db.dropDatabase();
    db.on('ready', function() {
        console.log('database connected');
    });
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';
    weatherAPI = db.collection('weatherAPI');
    weatherAPI.createIndex( { "id": 1 }, { unique: true } );

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});
initDb(function(err){});
//var mongojs= require('mongojs');
//var db = mongojs('mydb');

app = express();
// express.static middleware in an Express app:
// Serve static content for the app from the “public” directory in the application directory
app.use(express.static(__dirname));
// log all request in the Apache combined format to STDOUT
app.use(morgan('combined'));

//logger setup
var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.Console),
        new (winston.transports.File) ({filename: 'debug.log'})
    ]
});

// ---ROUTING---
app.get('/weather', function (req, resp) {
	
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
