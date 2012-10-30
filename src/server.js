var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
debugger
var server = http.createServer(ecstatic)
  , io = require('socket.io').listen(server)
  , fs = require('fs');

server.listen(8080);

// Router
//
//function handler (req, res) {
//  fs.readFile('src/index.html',
//  function (err, data) {
//    if (err) {
//      res.writeHead(500);
//      return res.end('1 Error loading index.html');
//    }
//
//    res.writeHead(200);
//    res.end(data);
//  });
//}

// Socket.io
//
// listen
io.on('connection', function (socket) {
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

//io.sockets.on('connection', function (socket) {
//  socket.emit('news', { hello: 'world' });
//  socket.on('my other event', function (data) {
//    console.log(data.my);
//  });
//});

// data storage
//var datamgr = require('./datamgr.js');
//datamgr.open();
//datamgr.insert( {b:2} );
