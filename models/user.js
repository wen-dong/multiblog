'use strict';
const db = require('./db');
function User(user){
  this.password = user.password;
  this.email = user.email;
  this.username = user.username;
  this.vcode = user.vcode;
  this.remember_me = user.remember_me;
  this.pic = user.pic;
}

User.findUserByUserName = function(username,callback){//根据姓名查询用户
  db.query('select * from users where username = ?',[username],callback);
};
User.findUserByEmail = function(email,callback){//根据邮箱查询用户
  db.query('select * from users where email = ?',[email],callback);
};
//保存用户信息
User.prototype.save = function(callback){
  db.query('insert into users (username,password,email,active_flag) values (?,?,?,0)',[this.username,this.password,this.email],callback)
};
//更新激活状态
User.updateActiveFlagByName = function(username,callback){
  db.query('update users set active_flag = 1 where username = ?',[username],callback);
}
//更新记住我标识
User.updateRememberMeByName = function(flag,username,callback){
  db.query('update users set remember_me = ? where username = ?',[flag,username],callback);
}
//更新个别字段
User.prototype.updateDetail = function(callback){
  db.query('update users set pic = ? where username = ?',[this.pic,this.username],callback);
}
module.exports = User;
