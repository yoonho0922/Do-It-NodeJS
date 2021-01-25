/*
 모듈 불러오기
 익스프레스 객체 생성 및 기본 설정
 뷰 엔진 설정
 패스포트 설정
 라우팅 설정
 에러 컨트롤
 서버 실행
 */

//==== 모듈 불러오기 ====//
// Express 기본 모듈
var express = require('express')
    , http = require('http')
    , path = require('path');

// Express 미들웨어
var bodyParser = require('body-parser')
    , cookieParser = require('body-parser')
    , static = require('serve-static')
    , expressErrorHandler = require('express-error-handler')
    , expressSession = require('express-session');

// 설정 모듈
var config = require('./config/config');
// 데이터베이스 모듈
var database  = require('./database/database');
// 라우팅 모듈
var route_loader = require('./routes/route_loader');
// 패스포트 사용
var passport = require('passport');
var flash = require('connect-flash');
// 채팅서버 관련 모듈
var socketio = require('socket.io');
var cors = require('cors');

//==== 익스프레스 객체 생성 및 기본 설정 ====//
var app = express();

app.set('port', process.env.PORT || 3000);
console.log('config.server_port : %d', config.server_port);
app.use('/public', static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));
app.use(cors());

//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

//==== 패스포트 설정 ====//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var configPssport = require('./config/passport');
configPssport(app, passport);

//==== 라우팅 설정 ====//
var router = express.Router()
route_loader.init(app, router);

// 패스포트 관련 함수 라우팅
var userPassport = require('./routes/user_passport');
userPassport(app, passport);

//==== 에러 컨트롤 ====//
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//==== 서버 실행 ====//
var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);

});

//==== socket.io 서버 시작 ====//
var io = socketio.listen(server);
console.log('socket.io 요청을 받아들일 준비가 되었습니다.')

//클라이언트가 연결했을 때의 이벤트 처리
io.sockets.on('connection', function(socket) {
    console.log('connection info :', socket.request.connection._peername);

    // 소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

    // 'message' 이벤트를 받았을 때의 처리
    socket.on('message', function(message){
        console.log('message 이벤트를 받았습니다.');
        console.dir(message);

        if(message.recepient === 'ALL'){
            // 나를 포함한 모든 클라이언트에게 메시지 전달
            console.dir('나를 포함한 모든 클라이언트에게 message 이벤트를 전송합니다.');
            io.sockets.emit('message', message);
        }
    });
});

