var mysql = require('mysql');
var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'itcast'
});

pool.getConnection(function(err, connection) {

  connection.query( 'select * from users where ',[], function(err, rows) {
    console.log(rows);
    connection.release();

  });
});
