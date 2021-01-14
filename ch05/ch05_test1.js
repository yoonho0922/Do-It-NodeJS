var http = require('http');

// 웹 서버 객체 만들기
var server = http.createServer();

// 웹 서버를 시작하여 3000번 포트에서 대기
var port = 3000;

server.listen(port, function(){
    console.log('웹 서버가 시작되었습니다 %d : ', port);
});