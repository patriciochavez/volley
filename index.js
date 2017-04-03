//var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var WebSocketServer = require('ws').Server;
var http = require('http');
var center = new Object();
center.lat = -34.5785;
center.lon = -58.64444;
var buzzer = 0;
var active = true;
var NodeTtl = require( "node-ttl" );
var current = new NodeTtl({
        ttl: 10,
        checkPeriode: 12});

var location = new Object();

var httpServer = http.createServer(app).listen(8080);
var wss = new WebSocketServer({server: httpServer});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

function getDistanceFromLatLonInMts(lat1,lon1,lat2,lon2) {
  var R = 6378137 // Radius of the earth in m
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in m
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

wss.on('connection', function(ws) {
    //console.log("Client connected!");
    //if (location != null) wss.broadcast(JSON.stringify(location));
    ws.on('message', function(message) {
    console.log(message);
    location = JSON.parse(message);
    current.push("location", location);
    if (location != null) wss.broadcast(JSON.stringify(location));
    });
});

wss.broadcast = function(data) {
    for(var i in this.clients) {
        this.clients[i].send(data);
    }
};

app.get(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/test':
            res.send("Ok!");
            break;
        case '/location':
            location = current.get("location");
            res.send(JSON.stringify(location));
            break;         
        case '/buzzer':
            location = current.get("location");
            if (active && location != null) {
                res.send("|" + buzzer);
            } else {
                res.send("|0");
            }            
            break;
        case '/active':
            res.send(active);            
            break;   
    default: //res.sendFile( __dirname + req.params[0]); 
    }
 });

app.post(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/location':
            //res.send(JSON.stringify(aceleracion));
            console.log(req.body.json);
            location = req.body.json;
            current.push("location", location);
            wss.broadcast(req.body.json);
            res.end(); 
            var mts = getDistanceFromLatLonInMts(center.lat,center.lon,location.latitude,location.longitude);
            console.log("mts: " + mts);
            if (mts < 100){
                buzzer = 1;
            } else if (mts < 200){
                buzzer = 2;
            } else if (mts < 300){
                buzzer = 3;
            } else {
                buzzer = 0;
            }
            break;
        case '/active':
            active = !active;
            res.end();            
            break;   
    default: //res.sendFile( __dirname + req.params[0]); 
    }
 });
