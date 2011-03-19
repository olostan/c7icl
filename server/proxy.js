/**
 * Important note: this application is not suitable for benchmarks!
 */

var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('../')
  , sys = require('sys')
  , net = require('net')
  , server;

function trim (str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
	if (/\S/.test(str.charAt(i))) {
	str = str.substring(0, i + 1);
	break;
    }
    }
    return str;
}
    
server = http.createServer(function(req, res){
  // your normal server code
  var path = url.parse(req.url).pathname;
  switch (path){
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Welcome. Try the <a href="/proxy.html">chat</a> example.</h1>');
      res.end();
      break;
      
    case '/json.js':
    case '/ansi.css':    
    case '/proxy.html':
      fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path == '/json.js' ? 'text/javascript' :path== '/ansi.css'? 'text/css': 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;
      
    default: send404(res);
  }
}),

send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};

server.listen(8080);

// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server);
//  , buffer = [];
  
io.on('connection', function(client){
//  client.send({ buffer: buffer });
//  client.broadcast({ announcement: client.sessionId + ' connected' });
//  client.send({ message: ['message',"hello<br />this is server" ]});
//  mud = stream.connect(9000,'mud.c7i.ru');
  var mud = net.createConnection(9000,'mud.c7i.ru');
  mud.setKeepAlive(true,500);
  mud.setNoDelay(true);
  mud.setEncoding('utf8');
  mud.on('data', function(data) {
    client.send({ message: data});
//    sys.log('recivied from mud. sending to client');
  });
  mud.on('close', function() {
    sys.log('mud closed connection');
    client.send({ message: '(Server closed connection)'});
  });
  client.on('message', function(message){
    //var msg = { message: [client.sessionId, message] };
    //buffer.push(msg);
    //if (buffer.length > 15) buffer.shift();
    //client.broadcast(msg);
    //mud.write(trim(message)+"\n\r",'utf8');
//    sys.log('got message from client:'+message);
    mud.write(message+"\n",'utf8');
  });
  

  client.on('disconnect', function(){
//    client.broadcast({ announcement: client.sessionId + ' disconnected' });
    sys.log("Client disconnected.");
    mud.end('quit');
  });
});
