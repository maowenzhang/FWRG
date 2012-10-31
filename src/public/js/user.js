// Define user information
function User(name) {
	this.name = name;
	this.sex = "male";
	this.avatar = "avatar";
	this.score = 0;
}

User.prototype.isNewUser = function() {
	return true;
}

User.prototype.toString = function() {
	return "user: " + this.name;
}

// Define player information, who is playing game
function Player(name) {
	User.call(this, name);
	this.cards = [];
	this.isActive = false;
	this.isLord = false;
	// Player's cards on table
	this.outcards = [];
}

// Player derives from User
Player.prototype = new User;

// For test
Player.prototype.allProperties = function() {
	var info = "";
	for(p in this) {
		var prop = p + ": " + this[p] + "\n";
		info = info + prop;
	}
	return info;
}

// function UserMgr() {
	// this.addPlayer = function(name) {
		// return new Player(name);
	// };
// }

//module.exports = new UserMgr();

