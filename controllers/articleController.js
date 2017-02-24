let Article = require('../models/article');
let userController = require('./userController');
let Comment = require('../models/comment');
const md = require('markdown-it')();
let Pager = require('../commons/pager.js');
let utils = require('utility');
var ta = require('time-ago')();
//显示发布页面
module.exports.showPublish = function(req, res, next) {
        res.render('publish', {
            user: req.session.user
        });
    }
    //保存发表文章
module.exports.publishArticle = function(req, res, next) {
    //接受数据
    let title = req.body.title;
    let content = req.body.content;
    let uid = req.session.user.id; //对于当前时间和默认值anwserCount 我们可以在服务器处理，也可以在数据库sql中处理
    let article = new Article({
        title,
        content,
        uid
    });
    //md转html内容
    article.content = md.render(article.content);
    article.save(function(err, result) {
        if (err) next(err);
        return res.redirect('/showArticle/' + result.insertId);
        //显示当前文章的详情页
    });
};
//显示首页
module.exports.showIndex = function(req, res, next) {
    //查询数据记录总数
    Article.getArticlesCount(function(err, data) {
        //对应总页数的计算
        if (err) next(err); //84 / 5
        let articlecount = data[0].totalCount; //记录数
        let viewsCount = req.app.locals.config.viewsCount; //每页显示多少
        let totalPages = Math.ceil(articlecount / viewsCount); //向上取整
        let currentPage = req.query.currentPage || 1;
        let offset = (currentPage - 1) * viewsCount;
        let pager = new Pager({
            currentPage,
            totalPages,
            pageUrl: '/'
        });
        Article.findArticlesAndUsersByLimit(offset, viewsCount, function(err, articles) {
            if (err) next(err);
            //查询用户信息
            for (var i = 0; i < articles.length; i++) { //美化日期
                articles[i].time = ta.ago(articles[i].time);
            }
            res.render('index', {
                articles,
                pager,
                user: req.session.user
            }); //articles:articles
        });
    });
};
module.exports.searchArticle = function(req, res, next) {
        //接收数据
        let q = req.body.q; //currentPage
        if (typeof q != 'undefined') {
            req.app.locals.q = q; //挂载全局最新值
        } else {
            q = req.app.locals.q; //如果通过点击翻页，全局的搜索关键字赋值给Q
        }
        //查询数据记录总数
        Article.getArticlesCountByCondition(q, function(err, data) {
            //对应总页数的计算
            if (err) next(err); //84 / 5
            let articlecount = data[0].totalCount; //
            let viewsCount = req.app.locals.config.viewsCount; //每页显示多少
            let totalPages = Math.ceil(articlecount / viewsCount); //向上取整
            let currentPage = req.query.currentPage || 1;
            let offset = (currentPage - 1) * viewsCount;
            let pager = new Pager({
                currentPage,
                totalPages,
                pageUrl: '/searchArticle'
            });
            Article.findArticlesAndUsersByConditionAndLimit(offset, viewsCount, q, function(err, articles) {
                if (err) next(err);
                //查询用户信息
                for (var i = 0; i < articles.length; i++) { //美化日期
                    articles[i].time = ta.ago(articles[i].time);
                }
                res.render('index', {
                    articles,
                    pager,
                    user: req.session.user
                }); //articles:articles
            });
        });
    }
//显示文章详情
module.exports.showArticle = function(req, res, next) {
    //接收数据
    let aid = req.params.aid;
    //通过文章Id查询数据
    Article.findArticleInfoById(aid, function(err, articles) {
        if (err) next(err);
        //查询文章评论的相关数据
        if (articles.length <= 0) {
            return res.render('showNotice', {
                'notice': '您要访问的连接不存在',
                href: '/',
                info: '请点击'
            });
        }
        Comment.findCommentsByAid(aid, function(err, comments) {
            if (err) next(err);
            let token = utils.md5('' + (+new Date)); //生成客户端token
            req.session.token = token; //服务器token
            //美化日期
            articles[0].time = ta.ago(articles[0].time);

            res.render('article', {
                article: articles[0],
                comments,
                user: req.session.user,
                token,
                helpers:{
                  checkEdit:  function(options) {
                                //如果作者与当前用户的id一致，就是true
                                if(!req.session.user){
                                  return options.inverse(this);//走else判断
                                }
                                let uid = req.session.user.id;
                                let authorId = articles[0].uid;//作者id
                                if(uid == authorId) {
                                  return options.fn(this);//走if判断 满足
                                } else {
                                  return options.inverse(this);//走else判断
                                }
                              }
                }
            });
        });
    });

}
