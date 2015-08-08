var express = require('express');
var app = express();

var counter = 1000;

app.get('/mock/ajax.json', function (req, res) {
  res.header('X-Sql-Queries' , 1 );
  res.header('X-Request-Id' , counter++ );
  res.send('{"foo":"bar","baz":42}');
});

app.use('/mock', express.static('mock'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});