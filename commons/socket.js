'use strict';
const sio = require('socket.io');
const cookie = require('cookie');
var isOk = false;
global.usersScockets = {};

module.exports.init = function(app, http){
  var io = sio.listen(http);
  io.use(function(socket, next) {
          var cookies = cookie.parse(socket.request.headers.cookie),
              username = cookies['username'];
              if(username){
                global.usersScockets[username] = socket.id;
                next();//符合条件的socket会被嫁到队列中
              }
  });
  module.exports.io = io;
}
