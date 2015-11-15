var express = require('express');
var app = express();

var counter = 1000;

app.get('/mock/ajax.json', function (req, res) {
  res.header('X-Sql-Queries' , 2 );
  //res.header('X-Request-Id' , 'a54b32e7-b94b-450b-b145-0cf62270d32a' );
  res.header('X-Request-Details' , '/mock/request/a54b32e7-b94b-450b-b145-0cf62270d32a' );
  
  res.send('{"foo":"bar","baz":42}');
});

app.use('/mock', express.static('mock'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});