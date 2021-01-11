var express = require('express')
, http = require('http')
, path = require('path');

var bodyParser = require('body-parser')
, cookieParser = require('body-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler')

var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');

// 익스프레스 객체 생성
var app = express();

// 초기화
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUnitialized:true
}));

// 라우터 객체 참조
var router = express.Router();
var user = require('./routes/user');

// 라우터 객체 등록
app.use('/', router);

// 서버시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ', app.get('port'));

    // 디비 연결
    connectDB();
});

// 데이터베이스
var mongoose = require('mongoose');

var database;
var UserSchema; // 데이터베이스 객체를 위한 변수 선언
var UserModel; // 데이터베이스 모델 객체를 위한 변수 선언

// 데이터베이스 연결
function connectDB(){
    // 데이터베이스 연결 정보
    var databaseUrl = 'mongodb://localhost:27017/local';
    // 데이터베이스 연결
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function(){
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
        //스키마 및 모델 객체 생성
        createUserSchema();

        // user 초기화
        user.init(database, UserSchema, UserModel);

    });
    // 연결 끊어졌을 때 5초 후 재연결
    database.on('disconnected', function(){
        console.log('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connectDB, 5000);
    });
}

// user 스키마 및 모델 객체 생성
function createUserSchema(){

    // user_schema.js 모듈 불러오기
    UserSchema = require('./database/user_schema').createSchema(mongoose);

    // UserModel 모델 정의
    UserModel = mongoose.model('users3', UserSchema);
    console.log('UserModel 정의함.');

}

// 라우팅
router.route('/process/login').post(user.login);
router.route('/process/login').post(user.adduser);
router.route('/process/login').post(user.listuser);

// 404 오류페이지 처리
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