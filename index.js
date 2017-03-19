//var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var WebSocketServer = require('ws').Server;
//var sesion_estado = "NULA";
//var timer;
var http = require('http');

var location = new Object();

var httpServer = http.createServer(app).listen(8080);
var wss = new WebSocketServer({server: httpServer});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

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
            break;
    default: //res.sendFile( __dirname + req.params[0]); 
    }
 });