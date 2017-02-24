'use strict';
const User = require('../models/user');
var utils = require('utility'); //md5加密
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
const moment = require('moment');
let pic = require('../commons/picture.js');

module.exports.showRegister = function(req, res, next) {
    res.render('register');
};
module.exports.doRegister = function(req, res, next) {
    //获取请求参数
    //req.body拿到请求体对象
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let vcode = req.body.vcode;
    //构造model对象
    let newUser = new User({
        username,
        password,
        email,
        vcode
    });
    //先判断验证码
    let s_code = req.session.vcode;
    if(s_code != vcode){
      return res.render('register',{msg:'注册码错误'});
    }
    //判断用户名是否存在
    User.findUserByUserName(newUser.username, function(err, users) {
        if (err) next(err); //express中处理错误
        if (users.length >= 1) { //有当前用户
            return res.render('register', {
                msg: '用户名已经存在'
            });
        }
        //没有查询到用户
        //邮箱是否存在
        User.findUserByEmail(newUser.email, function(err, users) {
            if (err) next(err); //express中处理错误
            if (users.length >= 1) { //有当前用户
                return res.render('register', {
                    msg: '邮箱已经存在'
                });
            }

            //保存用户信息之前，加密秘密字段
            newUser.password = utils.md5(utils.md5(newUser.password));

            //验证码是否存在(放到后面)
            // 邮箱不存在，用户名不存在
            //先存储用户信息，此时激活状态为否
            newUser.save(function(err, result) { //保存的就是加密后的密码
                if (err) next(err);
                //以上都满足，生成对应的激活邮箱(页面,激活地址)的操作
                let source = 'itcast_' + newUser.username;
                let token = utils.md5(utils.md5(source)); //足够安全
                let href = `http://127.0.0.1:8888/active?token=${token}&source=${source}`;
                let activeInfo = `尊敬的用户您好，恭喜您，注册成功！
                为了用户权益，请您到指定地址激活
              `;
                return res.render('showNotice', {
                    notice: activeInfo,
                    href: href,
                    info: '点击激活'
                });
                //激活成功的话，用户状态改为激活
            });
        });
    });
};
//激活用户
module.exports.activeAccount = function(req, res, next) {
    //接受数据 token 、source
    // console.log(req.query);
    let oldToken = req.query.token; //拿到发送来的token
    let source = req.query.source; //拿到原料itcast_abcdefg
    let token = utils.md5(utils.md5(source)); //秘制方式加工原料
    //如果生成成品与你带来的成品是一致的，说明，你是正品店过来的产品
    if (token != oldToken) {
        return res.render('showNotice', {
            notice: '非法激活！',
            href: '/register',
            info: '点我注册'
        })
    }
    //如果合法
    let username = source.split('_')[1];
    //先查询用户信息
    User.findUserByUserName(username, function(err, users) {
        if (users.length.length < 1) { //健壮性代码
            //用户不存在
            return res.render('register', {
                msg: '激活不成功，请注册'
            });
        }
        let user = users[0];
        //判断用户是否已经被激活
        if (user.active_flag == '1') {
            //提示用户，已经被激活了
            return res.render('showNotice', {
                notice: '账户已经被激活了，请勿重复激活',
                href: '/login',
                info: '点击登录'
            })
        }
        //修改用户的active_flag
        User.updateActiveFlagByName(username, function(err, result) { //update users set active_flag = 1 where username= ??
            if (err) next(err);
            res.render('login');
        });
    });
};
//显示登录
module.exports.showLogin = function(req, res, next) {
  //用户是否记住我，从数据库中获取  就能从用户系统获取cookie
    let user;
    if(req.cookies['remember_me']){
      let username = req.cookies['username'];
      let password = req.cookies['password'];//在存储cookie的时候密码加密，这时密码解密
      password = Buffer.from(password, 'base64').toString();//解密
      let remember_me = req.cookies['remember_me'];
      user = new User({username,password,remember_me});
    }
    console.log(user);
    res.render('login',{user});
};
//登录验证
module.exports.doLogin = function(req,res,next){
  //接收参数1 ： 可能是邮箱也可能是用户名
  let usernameOrEmail = req.body.username;//获取用户名或者邮箱
  let password = req.body.password;
  //接受是否记住我
  let remember_me = req.body.remember_me;//值有可能undefined
  let loginUser = new User({
    username : usernameOrEmail,
    password,
    remember_me
  });
  //验证是否有当前用户
  User.findUserByUserName(loginUser.username,function(err,usersByName){
    if(err) next(err);
    if(usersByName.length < 1){
      //没有该用户
      return User.findUserByEmail(loginUser.username,function(err,usersByEmail){
        if(err) next(err);
        if(usersByEmail.length < 1){
           //用户名或邮箱都不存在
           return res.render('login',{msg:'用户名或密码不存在!'});
        }
        //有当前用户邮箱是存在的
        let user = usersByEmail[0];//拿到用户信息
        comparePwdAndUpdateFlag(loginUser,user,req,res,next);

      });
    }
    //用户名是存在的
    //判断密码
    let user = usersByName[0];//拿到用户信息
    //比较密码和更新flag
    comparePwdAndUpdateFlag(loginUser,user,req,res,next);

  });
}
//退出
module.exports.doLogout = function(req,res,next){
  req.session.user = null;//清空session的用户信息
  res.redirect('/')//跳转到首页
};
//显示图片
module.exports.showPic = function(req,res,next){
  let returnObj = pic.getPicture();
  req.session.vcode = returnObj.content;//方便到时候点击注册的时候做比较
  res.send(returnObj.buf);
};
//比较密码和更新flag
function comparePwdAndUpdateFlag(loginUser,user,req,res,next){
  let password = utils.md5(utils.md5(loginUser.password));
  //判断密码是否一致
  if(password != user.password){
    //密码不正确
    return res.render('login',{msg:'用户名或密码不存在!'});
  }
  console.log('loginUser.remember_me',loginUser.remember_me);
    res.cookie('username',loginUser.username);//创建cookie
  if(loginUser.remember_me == '1'){//如果有值
    var b = Buffer.from(loginUser.password);//二进制
    var newPwd = b.toString('base64');//用base64加密

     password = Buffer.from(password, 'base64').toString();//解密
    res.cookie('password',newPwd);//记住我一周
    res.cookie('remember_me','1')
  }else if(typeof loginUser.remember_me == 'undefined'){
    res.cookie('password','',{maxAge:-1});
    res.cookie('remember_me','1',{maxAge:-1});
  }
    req.session.user = user;//保存用户session数据
    return res.redirect('/')
}
//显示设置
module.exports.showSettings = function(req,res,next){
  if(!req.session.user){
    return res.redirect('/index');
  }
  res.render('setting',{user:req.session.user});
}
//结束图片数据
module.exports.upload = function(req,res,next){
  var form = new formidable.IncomingForm();
    console.log('上传图片请求进来了');
   form.parse(req, function(err, fields, files) {
     if(err)next(err);
     //fs移动文件时，如果跨了盘符，C盘移动到D盘，就报错
     let sourcePath = files.pic.path;
     let middlePath = '/public'+'/img/'+moment().format('YYYY-MM-DD')+'/'+(+new Date())+''+path.extname(files.pic.name);
     let distPath = path.join(req.app.locals.config.rootPath,middlePath);
     //创建目标目录
     //fs-extra
     fs.move(sourcePath,distPath,function(err){
       if(err)next(err);
       res.json({path:middlePath});//服务器相对路径
     });
   });
};
//保存设置
module.exports.saveSettings = function(req,res,next){
  let username = req.body.username;
  console.log(req.body);//filePath
  let pic = req.body.filePath;//filePath
  let user = new User({username,pic});
  user.updateDetail(function(err,result){
    if(err)next(err);
    res.render('index',{user:req.session.user});
  });

}
