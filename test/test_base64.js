var b = Buffer.from('mima');//二进制
var s = b.toString('base64');

console.log(s);//到cookie

var b = Buffer.from(s, 'base64')
var s = b.toString();
console.log(s);//在登录前获取的密码
