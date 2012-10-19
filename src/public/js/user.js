// Define user information
function User(name) {
	this.name = name; // Display name or name id?
	this.sex;
	this.avatar;
	this.score;
	this.cards = [];
	this.active = false;
	this.isLord = false;
}

User.prototype.toString = function() {
	return "user: " + this.name;
}
