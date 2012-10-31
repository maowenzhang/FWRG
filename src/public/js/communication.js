var socket = io.connect('http://localhost:8080');

function GameSession() {
	this.view = null; // game view..
	this.joinedPlayers = null;
	this.sessionPlayerName = '';
	this.sessionPlayer = function() {
		if(!this.joinedPlayers || !this.sessionPlayerName)
			return null;
		for(var i = 0; i < this.joinedPlayers.length; ++i) {
			var player = this.joinedPlayers[i];
			if(player && player.name == this.sessionPlayerName)
				return player;
		}
		return null;
	}
	this.endSession = function() {
		this.view = null; 
		this.joinedPlayers = null;
		this.sessionPlayerName = '';
	}
	this.updateView = function() {
		this.view.sessionPlayer = this.sessionPlayer();
		this.view.joinedPlayers = this.joinedPlayers;
		this.view.update();
	}
}
var gameSession = new GameSession();

// Connected to server
socket.on('connect', function () {
    console.log("socket connected at localhost:8080");
	//sendUserLogin("lori");
});

// Disconnected to server
socket.on('disconnect', function () {
	console.log("socket disconnected");
	//sendUserEnd("lori");
});

// On getting update from server to clients
//
socket.on('updateFromServer', function(data) {
	console.log("client receives updateFromServer");
	console.log("get data from server: " + data);
	// TODO: add handling when get updates from server
	// Need to handle for different updating events and take proper action (such as: redraw game table)
	// data: gameState object
	//
	
	// New user login
	if (data.type == "login") {
		
	}
	else if (data.type == "") {
		
	}
	
	// Update session..
	gameSession.joinedPlayers = data.gameState.players;
	gameSession.updateView();
});

// Util method for client to call/sending message to server
//
function sendUpdateToServer(type, data) {
    socket.emit("updateFromClient", type, data);
}

function sendStatusRequestToServer() {
    socket.emit("statusRequest");
}

function sendUserLogin(playername) {
    sendUpdateToServer("login", playername);
	gameSession.sessionPlayerName = playername;
}

function sendUserReady(playername) {
    sendUpdateToServer("userReady", playername);
}

function sendUserProduce(pokerName) {
    sendUpdateToServer("produce", pokerName);
}

function sendUserEnd(playername) {
    sendUpdateToServer("end", playername);
	gameSession.endSession();
}
