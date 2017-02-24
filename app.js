'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
var exphbs  = require('express-handlebars');//引入模板引擎对象
var cookieParser = require('cookie-parser');
//创建服务器、处理请求（静态资源、解析body、路由操作）、开启服务器
let app = express();//创建服务器
let server = require('http').createServer(app);
//构架handlebars对象
let hbs = exphbs({
  extname: '.hbs',//设置后缀名
  defaultLayout: 'layout'//设置默认主体模板
});
app.engine('hbs', hbs);//创建引擎
app.set('view engine', 'hbs');//express关联视图引擎

//处理静态资源 /js/bootstrap-paginator.js
app.use('/public',express.static('public'));//可以到时候再设置虚拟目录调整路径
//解析body
app.use(bodyParser.urlencoded({ extended: false }));
//加入session处理中间件
app.use(session({
  secret: 'blog',
  resave: false,//表示着强制保存，如果一个session有未修改的内容，也跟着一起保存
  saveUninitialized: true // session有可能没有被初始化，也会创建session，只有再用到的时候才创建
}));
//解析cookie
app.use(cookieParser());
//路由设置开始

// web_router.get('/register',(req,res,next)=>{//express帮我们传入了3个参数，req,res,next
//   userController.showRegister(req,res,next); //3 req,res,next
// });
//添加本地变量
var config = require('./config.js');
app.use(function(req,res,next){
   req.app.locals.config = config;
   next();//next 这样让每一次请求都能给req.app.locals对象挂载config
});

//替换
let web_router = require('./web_router');
//路由设置结束
//将路由中间件添加进express
app.use(web_router);
//加上页面找不到中间件
app.all('*',function(req,res,next){
  res.render('404')
});

//错误处理中间件
app.use(function(err,req,res,next){
  console.log('出异常了',err.stack);
  next(); //执行下一个环节，不要卡在这里
});
//开启服务器
server.listen(80,'127.0.0.1',()=>{
  console.log('服务器启动了，80端口');
});
require('./commons/socket').init(app,server);
