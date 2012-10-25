var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
var server = http.createServer(ecstatic);
debugger
var server = http.createServer(ecstatic)
  , io = require('socket.io').listen(server)
  , fs = require('fs');

server.listen(8080);

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

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data.my);
  });
});



var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var client = new Db('test', new Server('127.0.0.1', 27017, {}), {safe:false}),
	test= function (err, collection) {
      collection.insert({a:2}, function(err, docs) {

        collection.count(function(err, count) {
          //test.assertEquals(1, count);
		  console.log("lori***: count: " + count);
        });

        // Locate all the entries using find
        collection.find().toArray(function(err, results) {
          //test.assertEquals(1, results.length);
          //test.assertTrue(results[0].a === 2);
		  console.log("lori***: a: " + results[0].a);
		  
		  for(var i=0; i<results.length; i++) {
			console.log(results[0].a);			
		  }
		  
          // Let's close the db
          client.close();
        });
      });
    };

client.open(function(err, p_client) {
  client.collection('test_insert', test);
});



