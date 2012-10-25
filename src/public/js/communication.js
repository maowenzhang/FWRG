//var io = require('socket.io');
$(function () {
    var socket = io.connect('http://localhost:8888');
    socket.on('connect', function () {
        console.log("Client connected");

        socket.emit('my other event', { my: 'data' });
    });

    socket.on('message', function (data) {
        console.log(data);
    });

    socket.on('disconnect', function () {
        console.log("Client disconnected");
    });
});