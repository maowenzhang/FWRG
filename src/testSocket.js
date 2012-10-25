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

    // connected
    socket.on('message', function (msg) {
        console.log('Received message from client', msg);
        socket.broadcast.emit('message', msg);
    });

    // disconnected
//    client.on('disconnect', function () {
//        console.log('Server has disconnected');
//    });

//    client.on('my other event', function (data) {
//        console.log("The other event : " + data);
//    });
});