var userMgr = require('./userserver.js');

// Define GameState class used to store game info
//
function GameState(name) {
	this.name = name;
	this.players = [];
	this.activePlayer = null;
	
	this.getPlayer = function(name) {
		for (var i=0; i<this.players.length; i++) {
			if (this.players[i].name == name) {
				return this.players[i];
			}
		}
		return null;
	}
	
	this.addPlayer = function(name) {
		console.log("add player");
		if (this.getPlayer(name)) {
			console.log("already has player: " + name);
			return true;
		}
		
		var newplayer = userMgr.addPlayer(name);
		console.log("create new player: " + newplayer);
		this.players.push(newplayer);
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
}

module.exports = new GameStateManager();