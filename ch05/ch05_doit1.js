var express = require('express');
var http = require('http');
var path = require('path');

var bodyParser = require('body-parser');
var static = require('serve-static');

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

// 익스프레스 객체 생성
var app = express();

// 라우터 객체 참조
var router = express.Router();

// 익스프레스 객체 생성
var app = express();

// 라우터 객체 참조
var router = express.Router();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}));

// body-parser 를 사용해 application/json 파싱
app.use(bodyParser.json());

//서버 파일에 접근 가능하게 해줌
app.use('/', static(path.join(__dirname, '')));

router.route('/memo').get(function(req, res){
    console.log('/memo 호출됨');
    
    res.redirect('/memo.html')
});

router.route('/process/save').post(function(req, res){
    console.log('/save 호출됨');
    
    var paramWriter = req.body.writer;
    var paramDate = req.body.date;
    var paramContent = req.body.content
    
    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    console.log(paramWriter)
    console.log(paramDate)
    console.log(paramContent)
    res.write('<h1>메모가 저장되었습니다.</h1>');
    res.write("<br><br><a href='/memo'>다시 작성</a>");
    res.end();
})


app.use('/', router);

app.all('*', function(req, res){
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
})

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});