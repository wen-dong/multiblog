'use strict';
var mysql = require('mysql');//引入对象
var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'wend'
}); //创建连接池

module.exports.query = function(sql,params,callback){//由model调用，传入sql，参数，回调
  pool.getConnection(function(err, connection) {//拿一个连接
    // console.log(sql,'======',params);
    connection.query(sql,params, function(err, rows) {//操作数据
      //宝宝就是rows 宝宝如何回家 通过
      if(err)callback(err,null);
      callback(null,rows);//调用回调通知model
      connection.release();//释放连接
    });
  });
}
