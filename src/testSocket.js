var http = require("http");
var io = require("socket.io");
var fs = require("fs");

// create server
var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(fs.readFileSync(__dirname + '/Public/testSocket.html'));
});

server.listen(8888);

// create socket
//var socket = io.listen(server);


// listen
io.listen(server).on('connection', function (socket) {

    var currentData = "test";

    // connected
    socket.on('message', function (msg) {
        console.log('Received message from client', msg);
        socket.broadcast.emit('message', msg);
    });

    // send data to all users
    socket.on('update', function (type, data) {
        console.log("Received messge are", type);
        socket.broadcast.emit('update', type, data);
    });
});