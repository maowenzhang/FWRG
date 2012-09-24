var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
var server = http.createServer(ecstatic);

var server = http.createServer(ecstatic)
  , io = require('socket.io').listen(server)
  , fs = require('fs');

server.listen(80);

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

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data.my);
  });
});