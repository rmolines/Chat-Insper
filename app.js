/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/chat', function(req, res){
  res.sendfile(__dirname + '/public/views/chat-view.html');
});

app.get('/login', function(req, res){
  res.sendfile(__dirname + '/public/views/login-view.html');
});

users = [];

io.on('connection', function(socket){
  console.log('A user connected');
  socket.on('setUsername', function(data){
    if(users.indexOf(data) > -1){
      socket.emit('userExists', data + ' username is taken! Try some other username.');
    }
    else{
      users.push(data);
      socket.emit('userSet', {username: data});
    }
  })
    socket.on('msg', function(data){
      //Send message to everyone
      io.emit('newmsg', data);
  })
});

http.listen(6001, function(){
  console.log('listening on *:6001');
});