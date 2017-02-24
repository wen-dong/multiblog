'use strict';
let Comment = require('../models/comment');
var ta = require('time-ago');
let socket = require('../commons/socket.js');
module.exports.saveComment = function(req,res,next){
  //接收数据
  let aid = req.body.articleid;
  let uid = req.body.userid;
  let content = req.body.content;//凭论内容
  let to_user = req.body.to_user;//发送名称
  let comment = new Comment({
    aid,uid,content
  });
  //保存之前先判断一下
  let s_token = req.session.token;
  let c_token = req.body.token;
  if(compareToken(s_token,c_token)){
    //合理的
    req.session.token = null; //关门收狗,频繁操作保存session数据短于6秒，express-session默认不保存
    req.session.save();//手动保存
    comment.save(function(err,result){
      if(err)next(err);
      console.log(global.usersScockets[to_user]);
      let socketid = global.usersScockets[to_user];
      console.log(socket.io.sockets);
      console.log('===========');
      console.log('socketid');
      if(socket.io.sockets.sockets[socketid]){

        socket.io.sockets.sockets[socketid].emit('myMsg','大叫好');
      }

      return res.redirect('/showArticle/'+aid);//条状当前文章的详情页
    });
  }else{
      return res.render('showNotice',{notice:'请勿重复提交',href:'/',info:'请点击'});
  }

}
function compareToken(s1,c1){
  if(s1 == null){
    //已经发送过请求
    return false;
  }else if(c1 == null){
    //非法操作
    return false;
  }else if(s1 != c1){
    //非法操作，本来可以点击，他不点击，模拟还做了一个token来玩
    return false;
  }
  return true;
}
