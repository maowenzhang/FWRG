//var io = require('socket.io');
var socket = io.connect('http://localhost:8080');
console.log("socket connected at localhost:8080");

function sendUpdateToServer(type, data) {
    socket.emit("update", type, data);
}

function sendStatusRequestToServer() {
    socket.emit("statusRequest");
}

function sendUserLogin(playername) {
    sendUpdateToServer("login", playername);
}

function sendUserReady(playername) {
    sendUpdateToServer("userReady", playername);
}

function sendUserProduce(pokerName) {
    sendUpdateToServer("produce", pokerName);
}

function sendUserEnd(playername) {
    sendUpdateToServer("end", playername);
}
