function GameStateManager() {
	this.gameStates = [];
	this.gameCount = 0;
}

GameStateManager.prototype.getGameState(name) {
	// get from mongodb
}

function GameState(name) {
	this.name = name;
	this.players = [];
	this.activePlayer = null;
}
	