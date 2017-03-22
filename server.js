// server.js
require('dotenv').config();
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
        
        socket.on('imageSubmit', function(url) {
            apiCall(url);
        });

        socket.on('disconnect', function() {
          console.log('browser closed');
        });
});

function emitName(name) {
    io.emit('cageVerified', name);
}

var apiCall = function(url) {
        var celebName;
        fetch('https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description&details=Celebrities&language=en', {  
            method: 'POST',  
            headers: {  
                'Content-Type':'application/json',
                'Ocp-Apim-Subscription-Key': process.env.MS_API  
            },  
            body: JSON.stringify({
                url: url,
            })
        })
        .then(function (response) {  
            return response.json();  
        })
        .then(function (j){
            celebName = j.categories[0].detail.celebrities[0].name;
            emitName(celebName);
        })
        .catch(function (error) {  
        console.log('Request failure: ', error);  
        });
}