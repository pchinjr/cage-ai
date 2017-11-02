// server.js
require('dotenv').config();
var fs = require('fs');
var express = require('express');
var app = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
var port = 3000;
var fetch = require('node-fetch');

//create the node server and serve the files
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
        res.sendFile(__dirname + '/public/index.html');
});
server.listen(port);
console.log('Cage Bot is now available to worship at http://localhost:' + port);

//silly global var

//SocketIO connection handler and listening
io.on('connect', function (socket) {
        console.log("your socket id is ", socket.id);

        socket.on('public-join', function(data) {
          console.log(data);
        });

        socket.on('cage-pi-connect', function(data) {
            console.log(data);
            socket.join('server-room');
        });

        socket.on('led:cage', function(data){
            socket.to('server-room').emit('led:cage');
            console.log('that is cage!');
        });

        socket.on('servo:set', function(data){
            socket.to('server-room').emit('servo:set', data);
            console.log('servo set to'+ data);
        });
        
        socket.on('sendFile', function(data, socketId) {
            var incomingData = data.replace(/^data:image\/\w+;base64,/, "");
            var buf = new Buffer(incomingData, 'base64');
            // fs.writeFileSync('public/image.png', buf);
            console.log('done writing file');
            //var location = 'http://45.55.86.193:3000/image.png';
            
            imagePost(buf, socket.id);
        });

        socket.on('disconnect', function() {
          console.log('browser closed');
        });
});
function emitName(name, socketId) {
    io.to(socketId).emit('cageVerified', name);
}

var imagePost = function(data, socketId) {
        var celebName;
        
        fetch('https://eastus.api.cognitive.microsoft.com/vision/v1.0/models/celebrities/analyze', {  
            method: 'POST',  
            headers: {  
                'Content-Type':'application/octet-stream',
                'Ocp-Apim-Subscription-Key': process.env.MS_API  
            },  
            body: data
        })
        .then(function (response) {  
            return response.json();  
        })
        .then(function (j){
            if (j.result.celebrities[0] === undefined || j.result.celebrities[0].name === undefined || j.result.celebrities[0].name === 0) {
                emitName('NOPE', socketId)
                
            } else {
                celebName = j.result.celebrities[0].name;
                emitName(celebName, socketId);
            };
        })
        .catch(function (error) {  
        console.log('Request failure: ', error);  
        });
};
