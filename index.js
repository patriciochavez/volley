var mqtt = require('mqtt');
var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var WebSocketServer = require('ws').Server;
var cookieParser = require('cookie-parser');
var http = require('http');
var center = new Object();
center.lat = -34.5785;
center.lon = -58.64444;
var buzzer = 0;
var sound = true;
var alarm = "nada";
var NodeTtl = require( "node-ttl" );
var current = new NodeTtl({
        ttl: 10,
        checkPeriode: 12});
var toAuth = new NodeTtl({
        ttl: 600,
        checkPeriode: 620});

var location = new Object();

var options = {
  port: '1883',
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: 'mi_usuario',
  password: 'mi_clave',
};

var mqttclient = mqtt.connect('mqtt://200.5.235.52', options);

var httpServer = http.createServer(app).listen(8080);
var wss = new WebSocketServer({server: httpServer});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

app.use(cookieParser());
app.set('views', __dirname + '/views')
app.set('view engine', 'jade');

var sesiones = new Array();
var usuario = "rayen";
var password = "mgx506";
var token;


mqttclient.on('connect', function() { // When connected
  mqttclient.subscribe('casa/buzzer', function() {
  });
});

/*
mqttclient.on('message', function(topic, message, packet) {
    mqttclient.publish('casa/buzzer/estado', alarm, function() {
    });
});
*/

function validarUsuario (u,p){    
    if (u == usuario && p == password) {
        token = Math.random().toString(36).substring(7);
        sesiones.push(token);
        //buscar la forma de borrar la sesion del array cuando expire    
    } else {
        token = "incorrecto";
    }
}

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
    if (location != null) wss.broadcast(JSON.stringify(location));
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
        case '/':
            res.render('login',{title:'Login'});
            res.end();                     
            break;
        case '/pos.html':
            res.sendFile(__dirname + req.params[0]);
            break;
        case '/mon.html':
            res.sendFile(__dirname + req.params[0]);
            break;
        case '/token':
            var guest = req.query.guest;        
            if (guest == toAuth.get(guest)) {
                sesiones.push(guest);                
                console.log(guest);
                res.cookie('token', guest, { expires: new Date(Date.now() + 900000) } );
                res.redirect('/pos.html');                    
                } else {
                    res.redirect('/');                    
                }        
            break;
        case '/location':
            location = current.get("location");
            res.send(JSON.stringify(location));
            break;         
    default: 
        res.sendFile( __dirname + req.params[0]); 
    }
 });

app.post(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/location':
            //res.send(JSON.stringify(aceleracion));
            console.log(req.body.json);
            location = JSON.parse(req.body.json);
            current.push("location", location);
            wss.broadcast(req.body.json);
            res.end(); 
            var mts = getDistanceFromLatLonInMts(center.lat, center.lon, location.latitude, location.longitude);
            console.log("mts: " + mts);
            if (mts < 100){
                buzzer = "1";
            } else if (mts < 200){
                buzzer = "2";
            } else if (mts < 300){
                buzzer = "3";
            } else {
                buzzer = "0";
            }
            //if(parseInt(buzzer) > 0 && sound){
            if(sound){                
                mqttclient.publish('casa/buzzer/distancia', buzzer, function() {
                });
            }
            break;
        case '/toauth':
            var android = new Object();
            android = JSON.parse(req.body.json);            
            if(android.usuario == usuario && android.password == password){
            var token_toAuth = Math.random().toString(36).substring(7);        
            toAuth.push(token_toAuth, token_toAuth);
            res.send(token_toAuth);
         }
        break;     
     case '/f_validarUsuario':
            token=null;
            validarUsuario(req.body.nombre, req.body.password);
            //console.log( "login: " + token);
            if (token!="incorrecto"){
                res.cookie('token', token, { expires: new Date(Date.now() + 900000) } );
                res.send({message: 'correcto', accion: 'redirect', destino:'/pos.html'});
                }else{
                   res.send({message:'incorrecto', accion: 'redirect', destino:'/'});
                   }
            res.end();
              break;
    case '/f_validarToken':
        var token_recibido = req.body.id;
        var token_existente = false;
        for (i = 0; i < sesiones.length; i++) {
            if(sesiones[i]==token_recibido){
                token_existente = true;
            }
        }
        for(j = 0; j < toAuth.length; j++){
            if(toAuth[j] == token_recibido){
                token_existente = true;
                }                
            }
        if(token_existente==true){
            res.send({message:'correcto', accion: 'nada'});
        }else{
            res.send({message:'incorrecto', accion: 'nada'});
        }
                res.end();
                break;  
    default: //res.sendFile( __dirname + req.params[0]); 
    }
 });
