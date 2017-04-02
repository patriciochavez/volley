//var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var WebSocketServer = require('ws').Server;
//var sesion_estado = "NULA";
//var timer;
var http = require('http');
var center = new Object();
center.lat = -34.5785;
center.lon = -58.64444;
var buzzer = 0;
var active = true;

var location = new Object();

var httpServer = http.createServer(app).listen(8080);
var wss = new WebSocketServer({server: httpServer});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

function getDistanceFromLatLonInMbts(lat1,lon1,lat2,lon2) {
  var R = 6371000; // Radius of the earth in m
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
    console.log("Client connected!");
    ws.on('message', function(message) {
    //location = JSON.parse(message);
    //wss.broadcast(JSON.stringify(location));
    console.log("Client says: " +  message);
    /*timer = setTimeout(function(){ 
        sesion_estado = "NULA"; 
                html_player_controller.sesion= "FINALIZAR_SESION";
        console.log(JSON.stringify(html_player_controller));
                wss.broadcast(JSON.stringify(html_player_controller));
        }, 30000);  
    } else if(sesion_estado == "ACTIVA"){
    clearTimeout(timer);
        timer = setTimeout(function(){
                sesion_estado = "NULA";
        html_player_controller.sesion = "FINALIZAR_SESION";
        console.log(JSON.stringify(html_player_controller));
        wss.broadcast(JSON.stringify(html_player_controller));  
                }, 30000);
        console.log( JSON.parse(message));
    var objeto = new Object();
    objeto = JSON.parse(message);
    wss.broadcast(JSON.stringify(objeto));
        //wss.broadcast(message);*/ 
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
            res.send(JSON.stringify(location));
            break;         
        case '/buzzer':
            if (active) {
                res.send("|" + buzzer);
            }
            res.end();            
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
            wss.broadcast(JSON.stringify(location));
            res.end(); 
            var mts = getDistanceFromLatLonInMbts(center.lat,center.lon,location.latitude,location.longitude);
            if (-100 > mts < 100){
                buzzer = 1;
            } else if (-200 > mts < 200){
                buzzer = 2;
            } else if (-300 > mts < 300){
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