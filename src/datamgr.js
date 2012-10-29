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