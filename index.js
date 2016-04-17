var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors({exposedHeaders: ['X-Sql-Queries', 'X-Request-Details', 'X-Time-To-First-Byte']}));
//app.use(cors());

var counter = 1000;

app.get('/mock/ajax.json', function (req, res) {
  res.header('X-Sql-Queries' , 2 );
  res.header('X-Time-To-First-Byte' , 21 );
  //res.header('X-Request-Id' , 'a54b32e7-b94b-450b-b145-0cf62270d32a' );
  res.header('X-Request-Details' , '/mock/request/a54b32e7-b94b-450b-b145-0cf62270d32a' );
  
  res.send('{"foo":"bar","baz":42}');
});

app.get('/mock/204.json', function (req, res) {
  res.header('X-Sql-Queries' , 1 );
  res.header('X-Time-To-First-Byte' , 21 );
  //res.header('X-Request-Id' , 'a54b32e7-b94b-450b-b145-0cf62270d32a' );
  res.header('X-Request-Details' , '/mock/sniffy/a54b32e7-b94b-450b-b145-0cf62270d32b' );
  res.send('{"foo":"bar","baz":42}');
});

app.get('/mock/sniffy/a54b32e7-b94b-450b-b145-0cf62270d32b', function (req, res) {
  res.status(204);
  res.send('');
});

app.use('/mock', express.static('mock'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var server2 = app.listen(3001, function () {
  var host = server2.address().address;
  var port = server2.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});