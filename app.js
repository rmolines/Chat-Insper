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

app.set('port', process.env.PORT || 6001);

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/public/views/chat-view.html');
});

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/public/views/login-view.html');
});

users = {};
var defaultRoom = 'Chapecoense';
var rooms = ["TecWeb", "Luciano", "Camila"];


io.on('connection', function(socket){
  console.log('A user connected');

  socket.emit('rooms', {
    rooms: rooms
  });

  socket.on('setUsername', function(data){
    if(users.hasOwnProperty(socket.id)){
      socket.emit('userExists', data + ' username is taken! Try some other username.');
    }
    else{
      data.room = defaultRoom;
      socket.join(defaultRoom);
      io.in(defaultRoom).emit('user joined', data);
      socket.emit('userSet', {username: users[0]});
    }
  })

  socket.on('switch room', function(data) {
    //Handles joining and leaving rooms
    //console.log(data);
    socket.leave(data.oldRoom);
    socket.join(data.newRoom);
    io.in(data.oldRoom).emit('user left', data);
    io.in(data.newRoom).emit('user joined', data);

  });

  socket.on('newUser', function(user){
    users[socket.id] = user;
    console.log(users[socket.id]);
  });

    socket.on('msg', function(data){
      //Send message to everyone
      io.emit('newmsg', {
        message: data.message,
        user: users[socket.id]
      });
      console.log(users[socket.id]);
  })
});

http.listen(6001, function(){
  console.log(app.get('port'));
});