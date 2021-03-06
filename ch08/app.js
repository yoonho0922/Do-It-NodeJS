// Express 기본 모듈
var express = require('express')
    , http = require('http')
    , path = require('path');

// Express 미들웨어
var bodyParser = require('body-parser')
    , cookieParser = require('body-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler')

// 에러 핸들러 모듈
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어
var expressSession = require('express-session');

//==== 설정 모듈 관련 ====//
// 설정 모듈
var config = require('./config');
// 데이터베이스 모듈
var database  = require('./database/database');
// 라우팅 모듈
var route_loader = require('./routes/route_loader');


// 익스프레스 객체 생성
var app = express();

//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);
// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))
// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());
// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));
// cookie-parser 설정
app.use(cookieParser());
// 세션 설정
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

// 라우팅 설정
route_loader.init(app, express.Router());

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
        '404' : './public/404.html'
    }
});
app.all('*', function(req, res){
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
})

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//==== 서버시작 ====//
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ', app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);
});

