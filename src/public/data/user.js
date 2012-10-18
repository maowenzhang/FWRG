// Define user information
function User(name) {
	this.name = name;
}

User.prototype.toString = function() {
	return "user: " + this.name;
}
