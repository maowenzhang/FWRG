// Require modules
var mongodb = require("mongodb"),
    mongoserver = new mongodb.Server('127.0.0.1', 27017, {}),
    db = new mongodb.Db("test", mongoserver, {safe:false});
	gameStateMgr = require("./gamestate.js");
	
// Class use to manage data
function DataMgr() {
	this.gameState = null;
	this.isOpened = false;
	
	this.getGameState = function(name) {
		console.log("datamgr.getgamestate: " + name);
		return gameStateMgr.getGame(name);
	}
	
	// Basic operations
	//
	this.insertData = function(col1, obj) {
		console.log("insert data");
		col1.insert(obj, function(err, col) {
			console.log("insert object: " + JSON.stringify(obj));
			//console.log(col);
		});
	};
	this.removeData = function(col1, obj) {
		console.log("remove data");
		col1.remove(obj, function(err, col) {
			console.log("remove object: " + JSON.stringify(obj));
		});
	};
	this.printData = function(col1, obj) {
		console.log("print data");
		col1.find().toArray(function(err, results) {
			console.log("all items in collection: " + JSON.stringify(results));
		});
	};
	
	this.op_gamestate = function(obj, op_func) {
		if (!this.isOpened) {
			this.open();
		}		

		db.collection('gamestate', function(err, col) {
			if (!err) {
				console.log("got gamestate colection");
			}
			else {
				console.log("fail to get gamestate colection!");
			}
			this.gamestate = col;
			//console.log(col);
			op_func(col, obj);
		});
	};
	
	// Basic operations
	//
	this.insert = function(obj) {		
		this.gameState.insert(obj, {safe:true}, function(err, col) {
			console.log("insert object: " + JSON.stringify(obj));
		});
	};
	this.remove = function(obj) {
		return this.op_gamestate(obj, this.removeData);
	};	
	this.print = function(obj) {
		return this.op_gamestate(obj, this.printData);
	};
	
	this.open = function() {
		db.open();
		console.log("db opened!");
		this.isOpened = true;
		
		this.gameState = db.collection('gamestate');
		if (this.gameState) {
			console.log("got game state");
		}
	}
	this.close = function() {
		db.close(function(err, p_client) {
			console.log("db closed!");
		});
	}
}

module.exports = new DataMgr();