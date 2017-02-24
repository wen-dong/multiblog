'use strict';
const express = require('express');
let userController = require('./controllers/userController');
let articleController = require('./controllers/articleController');
let commentController = require('./controllers/commentController');
let web_router = express.Router();
web_router.get('/',articleController.showIndex)
.get('/register',userController.showRegister)
.post('/doRegister',userController.doRegister)
.get('/active',userController.activeAccount)
.get('/login',userController.showLogin)
.post('/doLogin',userController.doLogin)
.get('/logout',userController.doLogout)
.get('/getPic',userController.showPic)
.get('/settings',userController.showSettings)
.post('/upload',userController.upload)
.post('/doSettings',userController.saveSettings)
.get('/publishArticle',articleController.showPublish)
.post('/publish/article',articleController.publishArticle)
.post('/searchArticle',articleController.searchArticle)//查找文章
.get('/searchArticle',articleController.searchArticle)//查找文章
.get('/showArticle/:aid',articleController.showArticle)//显示文章详情
.post('/comment/sendComment',commentController.saveComment)
module.exports = web_router;
