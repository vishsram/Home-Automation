#!/usr/bin/env nodejs

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Dequeue = require('dequeue');
var events = require("events");
var eventEmitter = new events.EventEmitter();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Routing server listening at http://%s:%s", host, port)

})

var reqQueue = new Dequeue();

// GET request from Raspberry pi
app.get('/echoIntent', function (req, res) {
   console.log("Got a GET request for the homepage");
   if (reqQueue.length != 0) {
      var data = reqQueue.pop();
      res.send( JSON.stringify(data) );
   }
})

// POST request from ECHO Ask
app.post('/echoIntent', function (req, res) {
   console.log("Got a POST request for the homepage");
   console.log( req.body );
   reqQueue.push(req.body);
   eventEmitter.on('feedback', function(reqB) {
      console.log((reqB));
      res.send(JSON.parse(reqB));
  })
})


// POST request from Raspberry pi with feedback about the command sent
app.post('/feedback', function (req, res) {
   console.log("Got a POST request for feedback");
   console.log( req.body );
   var data = JSON.stringify(req.body);
   eventEmitter.emit ('feedback', data);
   res.send(data);
})



