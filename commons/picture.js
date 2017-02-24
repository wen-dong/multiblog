var captchapng = require('captchapng');
module.exports.getPicture = function(){
        var str = '0123456789';
        var content  = '';
        for (var i = 0; i < 4; i++) {
              content += (Math.random()+"").substr(2,1);
        }
        //加入session
        var p = new captchapng(80,30,content); // width,height,numeric captcha
        p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
        p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        var returnObj = {};
        returnObj.buf = imgbase64;
        returnObj.content = content;
        return returnObj;
}
