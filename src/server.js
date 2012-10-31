// Start HTTP server
//
var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
var server = http.createServer(ecstatic)
  , io = require('socket.io').listen(server)
  , fs = require('fs');

server.listen(8080);

// Data storage
//
var datamgr = require('./datamgr.js');
//datamgr.open();
//datamgr.insert( {b:2} );

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
function EventData(type, gameState) {
	this.type = type;
	this.gameState = gameState;
}

function updateFromServerToClients(socket, eventdata) {
	console.log("update from server to all clients!");
	console.log("event data: ", eventdata);
	socket.broadcast.emit('updateFromServer', eventdata);
	socket.emit('updateFromServer', eventdata);
}

io.on('connection', function (socket) {
    // connected
	socket.on('message', function (msg) {
		console.log('Received message from client', msg);
		socket.broadcast.emit('message', msg);
	});

	// Getting updates from clients
	socket.on('updateFromClient', function (type, data) {
		console.log("updateFromClient");
		console.log("Received messge type: ", type);
		console.log("received message data: ", data);
		debugger
		var gs = datamgr.getGameState("firstGame");			
		
		if (type == "login"){
			console.log("new user: " + data + " joined!");
			// add new player
			gs.addPlayer(data);
		}
		else if (type == "userReady") {
			// update player status
			
		}
		
		var eventdata = new EventData(type, gs);
		updateFromServerToClients(socket, eventdata);
	});
});

//io.sockets.on('connection', function (socket) {
//  socket.emit('news', { hello: 'world' });
//  socket.on('my other event', function (data) {
//    console.log(data.my);
//  });
//});
