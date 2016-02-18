#!/usr/bin/env nodejs

var WebSocket = require('ws');
var request = require('request');
var WSConnectCmd = '{"mii":"12346", "cmd":"devicelist"}';
var WSSwitchOn = '{ "mii":"123458", "cmd":"setdeviceindex", "devid":"1","index":"1","value":"true"}';
var WSSwitchOff = '{ "mii":"123458", "cmd":"setdeviceindex", "devid":"1","index":"1","value":"false"}';

var ws = new WebSocket('ws://serveripaddress/username/password');

var options = {
   url: 'http://localhost:8081/echoIntent',
   method: 'GET',
   timeout: 10000,
   headers: {
       'Content-Type': 'application/json',
       'Connection': 'keep-alive'
    }
};

function callback(error, response, body) {
    if (!error) {
         var data = JSON.parse(body);
         console.log ("Data from server:" + JSON.stringify(data));
         console.log(data.slots.Switch.value);
         if (data.slots.Switch.value != "on") {
             console.log ("Switch off");
             ws.send(WSSwitchOff);
         }
         else {
             console.log ("Switch on");
             ws.send(WSSwitchOn);
         }
       }
    else {
        console.log('Error happened: '+ error);
    }
    getRequest();
} 


function getRequest() {
   request(options, callback);
}

ws.on('open', function open() {
  console.log('connected');
});

ws.on('close', function close() {
  console.log('disconnected');
});

ws.on('message', function message(data, flags) {
   console.log("Data from Web socket server:");
   console.log(JSON.stringify(JSON.parse(data), null, 2)); 
   // Send feedback to server
   var info = JSON.parse(data);
   
   // Emit feedback only if the received message is of SensorUpdate type
   if (info.commandtype === "SensorUpdate") {
      var switchData = info.data;

      if (switchData["1"]["1"]["value"] === "true") {
          console.log("Light on"); 
          request.post({url:'http://localhost:8081/feedback', form: {'lightstatus': { status: 'on' }}});
       }
       else {
          console.log("Light off"); 
          //socket.emit('lightstatus', { status: 'off' });
          request.post({url:'http://localhost:8081/feedback', form: {'lightstatus': { status: 'off' }}});
       }
    }
});

// Initialize GET request
getRequest();

