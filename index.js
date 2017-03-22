var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var WebSocketServer = require('ws').Server;
var sesion_estado = "NULA";
var timer;
var location = new Object();
var http = require('http');

var httpServer = http.createServer(app).listen(8080);
var wss = new WebSocketServer({server: httpServer});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

wss.on('connection', function(ws) {
    console.log("Client connected!");
    ws.on('message', function(message) {
    console.log(message);
    location = JSON.parse(message);
    wss.broadcast(JSON.stringify(location));
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
    default:
            res.sendFile( __dirname + req.params[0]);
    }
 });

app.post(/^(.+)$/, function(req, res){
    switch(req.params[0]) {
        case '/location':
            console.log(req.body.json);
            location = JSON.parse(req.body.json);
            wss.broadcast(JSON.stringify(location));
            res.end();
            break;
    default:
            res.sendFile( __dirname + req.params[0]);
    }
 });
