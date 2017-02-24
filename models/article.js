const db = require('./db.js');
//构造函数
function Article(article){
  this.id = article.id;
  this.uid = article.uid;
  this.title = article.title;
  this.content = article.content;
  this.answerCount = article.answerCount;
  this.time = article.time;
}
//保存文章
Article.prototype.save = function(callback){
  db.query(`insert into articles (uid,title,content,answerCount,time) values
  (?,?,?,0,current_timestamp)`,[this.uid,this.title,this.content],callback);
};
//统计文章总数
Article.getArticlesCount = function(callback){
  db.query('select count(*) as "totalCount" from articles ',[],callback);
};
//根据限制查询文章
Article.findArticlesAndUsersByLimit = function(offset,count,callback){
  db.query(`
          SELECT
                t1.id AS 'aid',
                t1.title,
                t1.content,
                t1.time,
                t1.uid,
                t1.answerCount,
                t2.username,
                t2.pic
                FROM
                articles t1
                LEFT JOIN users t2 ON t1.uid = t2.id order by t1.time desc 
                LIMIT ?,?
    `,[offset,count],callback);
};
//根据关键字查询文章
Article.findArticlesAndUsersByConditionAndLimit = function(offset,count,q,callback){
  db.query(`
          SELECT
                t1.id AS 'aid',
                t1.title,
                t1.content,
                t1.time,
                t1.uid,
                t1.answerCount,
                t2.username,
                t2.pic
                FROM
                articles t1
                LEFT JOIN users t2 ON t1.uid = t2.id
                where t1.title like ?
                LIMIT ?,?
    `,['%'+q+'%',offset,count],callback);
}
//根据搜索查询总数
Article.getArticlesCountByCondition = function(q,callback){
  db.query('select count(*) as "totalCount" from articles where title like ?',['%'+q+'%'],callback);
};
//查询文章以及作者信息根据id
Article.findArticleInfoById = function(aid,callback){
  db.query(`
    SELECT
          t1.id AS 'aid',
          t1.title,
          t1.content,
          t1.time,
          t1.uid,
          t1.answerCount,
          t2.username,
          t2.pic
    FROM
        articles t1
    LEFT JOIN users t2 ON t1.uid = t2.id
    WHERE
    t1.id = ?
    `,[aid],callback)
}
module.exports = Article;
