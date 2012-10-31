// Data storage
var datamgr = require('./datamgr.js');
//datamgr.open();
//datamgr.insert( {b:2} );

// Socket.io
//
var io = null;

function EventData(type, gameState) {
	this.type = type;
	this.gameState = gameState;
}

function updateClients() {
	
}

function start(server) {
	console.log("start socket");
	
	io = require('socket.io').listen(server);
	
	io.on('connection', function (socket) {

		// connected
		socket.on('message', function (msg) {
			console.log('Received message from client', msg);
			socket.broadcast.emit('message', msg);
		});

		// Getting updates from clients
		socket.on('updateToServer', function (type, data) {
			console.log("updateToServer");
			console.log("Received messge type: ", type);
			console.log("received message data: ", data);
			debugger
			var gs = datamgr.getGameState("firstGame");
			var eventdata = new EventData(type, gs);
			
			if (type == "login"){
				console.log("new user: " + data + " joined!");
				// add new player
				
				return;
			}			
			
			console.log("event data: ", eventdata);
			socket.broadcast.emit('updateToClients', type, eventdata);
		});
	});
}

//io.sockets.on('connection', function (socket) {
//  socket.emit('news', { hello: 'world' });
//  socket.on('my other event', function (data) {
//    console.log(data.my);
//  });
//});

module.exports = function(server) {
	start();
};