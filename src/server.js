// Start HTTP server
//
var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
var server = http.createServer(ecstatic)
  , io = require('socket.io').listen(server)
  , fs = require('fs');

server.listen(8080);

// Data storage
//
var datamgr = require('./datamgr.js');
//datamgr.open();
//datamgr.insert( {b:2} );

// Router
//
//function handler (req, res) {
//  fs.readFile('src/index.html',
//  function (err, data) {
//    if (err) {
//      res.writeHead(500);
//      return res.end('1 Error loading index.html');
//    }
//
//    res.writeHead(200);
//    res.end(data);
//  });
//}

var roomState = require('./gameHall.js');
// set the param of game hall
roomState.numTables = 16;
roomState.numSeats = 3;
// only one game hall for all game states..
var gameHall = roomState.getGameHall();
		
// Socket.io
//
// listen
function EventData(type, gameState) {
	this.type = type;
	this.gameState = gameState;
}

function updateFromServerToClients(socket, eventdata) {
	console.log("------------- update from server to all clients, type: " + eventdata.type);
	console.log("event data: ", eventdata);
	socket.broadcast.emit('updateFromServer', eventdata);
	socket.emit('updateFromServer', eventdata);
}

io.on('connection', function (socket) {
    // connected
    socket.on('message', function (msg) {
        console.log('Received message from client', msg);
        socket.broadcast.emit('message', msg);
    });

    // chat message
    socket.on('chatMsg', function (ctrlId, msg) {
        console.log('Received chat message from ', msg);
        socket.broadcast.emit('chatMsg', ctrlId, msg);
    });

    // Getting updates from clients
    socket.on('updateFromClient', function (type, data) {
        console.log("/n=============== updateFromClient, type: " + type);
        console.log("Received data: ", data);

        var gs = datamgr.getGameState("firstGame");
        var p1ayername = data.playerName;
        var gameTable, player;

        if (type == "login") {
            console.log("player: " + p1ayername + " joined!");
            // add new player
            gs.addPlayer(p1ayername);
        }
        else if (type == "userReady") {
            console.log("player: " + p1ayername + " is ready!");
            var p1 = gs.getPlayer(p1ayername);
            p1.isReady = true;
            // try to start the game and deliver cards..
            if (gs.tryStartGame()) {
                console.log(gs.deck.cards);
                var remainCards = 3;
                var curPlayer = 0;
                var cards = gs.deck.cards;
                while (cards.length > 0) {
                    console.log(curPlayer);
                    player = gs.getPlayerByIndex(curPlayer++);
                    if (!player) {
                        console.log('invalid player');
                        break;
                    }
					
					if(cards.length == remainCards)
					{
						player = gs.lordPlayer();
						for(var i = 0; i < remainCards; ++i)
						{
							player.cards.push(cards[i]);
							gs.lastCards.push(cards[i]);
						}
						cards.splice(0, cards.length);
					}
                    else if (cards.length > remainCards) {
                        player.cards[player.cards.length] = cards[0];
                        cards.splice(0, 1);
                        //console.log(cards.length);
                    }

					gs.activePlayer = player;
                    var eventdata = new EventData("deliverCard", gs);
                    updateFromServerToClients(socket, eventdata);

                    if (curPlayer > 2) curPlayer = 0;
                }
            }
        }
        else if (type == "end") {
            console.log("player: " + p1ayername + " left!");
            gs.removePlayer(p1ayername);
            //TODO: consider the observer's leave (since it won't affect the game progress.
            gs.endGame();
        }
        else if (type == "selectSeat") {
            console.log(data.playerName + " selected the seat ( table: " + data.tableIndex + ", seat: " + data.seatIndex);
            player = gs.getPlayer(p1ayername);
            if (!player) {
                console.log('ERROR: invalid player ' + data.playerName);
            } else {
                player.table = data.tableIndex;
                player.seat = data.seatIndex;
            }
        }

        var eventdata = new EventData(type, gs);
        updateFromServerToClients(socket, eventdata);
    });
});

//io.sockets.on('connection', function (socket) {
//  socket.emit('news', { hello: 'world' });
//  socket.on('my other event', function (data) {
//    console.log(data.my);
//  });
//});
