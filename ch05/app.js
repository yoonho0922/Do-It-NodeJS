//Express 기본 모듈 불러오기
var express = require('express'), http = require('http');

var app = express();

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', process.env.PORT || 3000);

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스 서버를 시작했습니다. : ', + app.get('port'));
}); v