const db = require('./db');

function Comment(comment){
  this.id = comment.id;
  this.content = comment.content;
  this.time = comment.time;
  this.aid = comment.aid;
  this.uid = comment.uid;
}

Comment.findCommentsByAid = function(aid,callback){
  db.query(`SELECT
                	t1.id cid,
                	t1.content,
                	t1.time,
                	t1.aid,
                	t2.id uid,
                	t2.username,
                	t2.pic
            FROM
            	comments t1
            LEFT JOIN users t2 ON t1.uid = t2.id
            WHERE
            	aid = ? order by t1.time desc `,[aid],callback);
};
Comment.prototype.save = function(callback){
  db.query('insert into comments (content,time,uid,aid) values (?,now(),?,?)'
  ,[this.content,this.uid,this.aid],callback);
};
module.exports = Comment;
