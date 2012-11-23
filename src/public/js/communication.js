var socket = io.connect('http://localhost:8080');

function GameSession() {
	this.view = null; // game view..
	this.sessionPlayerName = '';
	
	this.sessionPlayer = function(gameState) {
		var joinedPlayers = gameState.players;
		if(!joinedPlayers || !this.sessionPlayerName)
			return null;
		var player = null;
		for(var i = 0; i < joinedPlayers.length; ++i) {
			player = joinedPlayers[i];
			if(player && player.name == this.sessionPlayerName)
				return player;
		}
		return null;
	}
	
	this.endSession = function() {
		this.gameState = null;
		this.sessionPlayerName = '';
	}
	
	this.updateView = function(data) {
		var event = { gameState: data.gameState,
					  eventType: data.type,
					  sessionPlayer: this.sessionPlayer(data.gameState)
					};
		this.view.update(event);
	}
}
var gameSession = new GameSession();
var curPlayerName = getCurUser().name;
gameSession.sessionPlayerName = curPlayerName;

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

// chat message
socket.on("chatMsg", function (ctrlId, msg) {
    updateChatMsg(ctrlId, msg);
});

// On getting update from server to clients
//
socket.on('updateFromServer', function(data) {
	console.log("/n=============== updateFromServer, type: " + data.type);
	console.log("Received data: ", data);
	
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
	gameSession.updateView(data);
});

// Util method for client to call/sending message to server
//
function sendUpdateToServer(type, input) {
	var data = {};
	data.playerName = curPlayerName;
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

function selectSeat(playername, tableIdx, seatIdx) {
	var data = { playerName: playername, 
				 tableIndex: tableIdx,
				 seatIndex: seatIdx
			   };
    socket.emit("updateFromClient", "selectSeat", data);
}

function sendPlayedCards(playerName, cards) {
	var data = {};
	data.playerName = playerName;
	data.cards = cards;
	socket.emit("updateFromClient", "playCards", data);
}

function sendChatMsg(ctrlId, msg) {
    socket.emit("chatMsg", ctrlId, msg);
}