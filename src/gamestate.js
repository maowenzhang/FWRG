// Define GameState class used to store game info
//
function GameState(name) {
	this.name = name;
	this.players = [];
	this.activePlayer = null;
}

// Define manager class to manager all GameStates
//
function GameStateManager() {
	this.gameStates = {};
	this.gameCount = 0;
	this.getGame = function(name) {
		// get from mongodb
		//for (item in gameStates){
		//	if (item.name == name){
		//		return item;
		//	}
		//}
		return null; //gameStates[name];
	}
	
	this.addGame = function(name) {
		var gs = new GameState(name);
		this.gameStates[name] = gs;
	}
}