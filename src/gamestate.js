var userMgr = require('./userserver.js');
var gameLogic = require('./card.js');

// Define GameState class used to store game info
//
function GameState(name) {
	this.name = name;
	this.players = [];
	this.activePlayer = null;
	this.deck = null;
	this.started = false;
	this.lastCards = [];
	
	this.getPlayer = function(name) {
		for (var i=0; i<this.players.length; i++) {
			if (this.players[i].name == name) {
				return this.players[i];
			}
		}
		return null;
	}
	
	this.lordPlayer = function()
	{
		for(var i = 0; i < this.players.length; i++)
		{
			if(this.players[i].isLord)
				return this.players[i];
		}
		return null;
	}
	
	this.getPlayerByIndex = function(index) {
		if(index >= this.players.length)
			return null;
		return this.players[index];
	}
	
	this.addPlayer = function(name) {
		console.log("add player");
		if (this.getPlayer(name)) {
			console.log("already has player: " + name);
			return true;
		}
		
		var newplayer = userMgr.addPlayer(name);
		console.log("create new player: " + newplayer);
		
		// automatically allocate seat for the new player
		if(this.players.length == 1)
		{
			// first player sit at 0 seat
			this.players[0].rightPlayer= newplayer.name;
			newplayer.leftPlayer = this.players[0].name;
		}
		else if(this.players.length == 2)
		{
			// third player login in, sit last seat
			newplayer.leftPlayer = this.players[1].name;
			this.players[1].rightPlayer = newplayer.name;
			
			newplayer.rightPlayer = this.players[0].name;
			this.players[0].leftPlayer = newplayer.name;			
		}
		
		this.players.push(newplayer);
	}
	
	this.removePlayer = function(name) {
		console.log("try to remove player");
		var idx = -1; 
		for(var i = 0; i < this.players.length; ++i) {
			var player = this.players[i];
			if(player && player.name == name) {
				idx = i;
				break;
			}
		}
		if(idx >= 0) { 
			this.players.splice(idx, 1); 
			console.log("player " + name + " is removed");
		}
	}
	
	// If all players are ready, we think the game is ready to play around.
	this.allReady = function() {
		if(this.players.length < 3)
			return false;
		for(var i = 0; i < this.players.length; ++i) {
			if(!this.players[i].isReady)
				return false;
		}
		return true;
	}
	
	// If all players are ready, we can start game automatically.
	this.tryStartGame = function() {
		if(this.started || !this.allReady())
			return false;
		this.deck = gameLogic.newDeck();
		this.deck.shuffle();
		this.started = true;
		
		// Decide the lord randomly
		var numPlayer = this.players.length;
		var lordIdx = ((Math.random * numPlayer) % numPlayer) >> 0;
		this.players[lordIdx].isLord = true;

		return true;
	}
	
	this.endGame = function(datamgr, gameId) {
		if(!this.started)
			return;
		this.started = false;
		// Any other things need to do?..
		if(datamgr && this.players.length == 0) {
			datamgr.removeGame(gameId);
		}
	}
}

// Define manager class to manager all GameStates
//
function GameStateManager() {
	this.states = [];
	this.gameCount = function() {
		return states.length;
	};
	
	this.getGame = function(name) {
		// TODO: get from mongodb
		console.log("game state: " + this.states.length);
		
		for (var i=0; i<this.states.length; i++){
			if (this.states[i].name == name){
				console.log("already has gamestate: " + name);
				return this.states[i];
			}
		}
		// create one if hasn't
		return this.addGame(name);
	};
	
	this.addGame = function(name) {
		console.log("create new gamestate: " + name);
		var gs = new GameState(name);
		this.states.push(gs);
		return gs;
	};
	
	this.removeGame = function(name) {
		for (var i=0; i<this.states.length; i++){
			if (this.states[i].name == name){
				console.log("remove the game: " + name);
				this.states.splice(0, 1);
			}
		}
	}
}

module.exports = new GameStateManager();