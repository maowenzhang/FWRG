function PlayerInSeat(player, seat) {
	this.player = player;
	this.seat = seat;
}

function GameTable(tableId, numSeats) {

	this._init = function(tableId, numSeats) {
		this.tableId = tableId;
		this.playersInSeats = [];
		this.observers = [];
		this.numSeats = numSeats;
	}
	this._init(tableId, numSeats);

	// Return true if the table is available to join
	this.avaiable = function() {
		return this.playersInSeats.length < this.numSeats;
	}
	
	// Join the game in this table with specified seat..
	this.join = function(player, seat) {
		if(this.playersInSeats.length < this.numSeats && seat < this.numSeats) {
			this.playersInSeats[playersInSeats.length] = new PlayerInSeat(player, seat);
		} else {
			this.observers[this.observers.length] = player;
		}
		return true;
	}

	// Automatically join the game if there's one available seat.
	this.autoJoin = function(player) {
		if(this.playersInSeats.length >= this.numSeats) {
			// In auto-join mode, we don't allow player can log in as a observer.
			return false;
		} else {
			// find a valid seat on this table.
			var seatsWithPlayers = [];
			var j = 0;
			for(var i = 0; i < this.playersInSeats.length; ++i) {
				var seat = this.playersInSeats[i].seat;
				seatsWithPlayers[j++] = seat;
			}
			for(j = 0; j < this.seats.length; ++j) {
				if(!seatsWithPlayers.contains(j))
					return this.join(player, j);
			}
			console.log('ERROR in GameTable.autoJoin');
		}
	}
	
	this.leave = function(player) {
		var idx = -1;
		for(var i = 0; i < this.playersInSeats.length-1; ++i) {
			if(this.playersInSeat[i].player == player) {
				idx = i;
				break;
			}
		}
		if(idx != -1) {
			this.playersInSeats.remove(this.playersInSeats[idx]);
			return true;
		}
		return false;
	}
}

function GameHall(numTables, numSeats) {

	this._init = function(numTables, numSeats) {
		this.numTables = numTables;
		this.numSeats = numSeats;
		this.tables = [];
		for(var i = 0; i < numTables; ++i) {
			this.tables[i] = new GameTable(i, numSeats);
		}
	}
	this._init(numTables, numSeats);
	
	this.getTable = function(index) {
		if(this.tables.length == 0 || index >= this.tables.length)
			return null;
		return this.tables[index];
	}
	this.firstTable = function() {
		return this.getTable(0);
	}
	this.lastTable = function() {
		return this.getTable(this.tables.length-1);
	}
	this.availableTable = function() {
		for(var i = 0; i < this.tables.length; ++i) {
			var table = this.tables[i];
			if(table.available())
				return table;
		}
		return null;
	}
}

function GameRoomState() {
	this.gameHall = null;
	this.numTables = 1;
	this.numSeats = 3;
	
	this.getGameHall = function() {
		if(!this.numTables || !this.numSeats || this.numSeats < 3)
			return null;
			
		if(!this.gameHall) {
			this.gameHall = new GameHall(this.numTables, this.numSeats);
		}
		return this.gameHall;
	}
}

module.exports = new GameRoomState();