var express = require('express');
var cfenv = require('cfenv');
var app = express();
var appEnv = cfenv.getAppEnv();
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var http = require('http').createServer(app);


app.use(express.static(__dirname + '/public'));
app.listen(appEnv.port, '0.0.0.0', function() {
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

var users = {};
var clients = [];
var defaultRoom = 'Chapecoense';
var rooms = ["TecWeb", "Luciano", "Camila"];



io.on('connection', function(socket){


  socket.on('setUsername', function(data){
    if(users.hasOwnProperty(socket.id)){
      socket.emit('userExists', data + ' username is taken! Try some other username.');
      console.log('deu ruim');
      }
    else{
      // data.room = defaultRoom;
      //socket.join(defaultRoom);
      //io.in(defaultRoom).emit('user joined', data);
      socket.emit('userSet', {username: users[0]});
      console.log(users[0]);
    }
  });

  socket.on('switch room', function(data) {
    //Handles joining and leaving rooms
    //console.log(data);
    socket.leave(data.oldRoom);
    socket.join(data.newRoom);
    io.in(data.oldRoom).emit('user left', data);
    io.in(data.newRoom).emit('user joined', data);

  });

  socket.on('room-request', function(){
    socket.emit('rooms', rooms);    
  });

  socket.on('newUser', function(user){
    users[session.id] = { user: user.user, room: user.room };
    clients.push(socket);
  });

    socket.on('msg', function(data){
      //Send message to everyone
      io.emit('newmsg', {
        message: data.message,
        user : users[session.id].user
      });
  });
});

http.listen(6001, function(){
  console.log(app.get('port'));
});