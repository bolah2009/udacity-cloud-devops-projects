var http = require('http');
var server = http.createServer(function (req, res) {
  res.writeHead(200);
  res.end('Hi there ...!');
});
server.listen(80);
