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
var config = require('./config');
// 데이터베이스 모듈
var database  = require('./database/database');
// 라우팅 모듈
var route_loader = require('./routes/route_loader');
// 패스포트 사용
var passport = require('passport');
var flash = require('connect-flash');

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

//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

//==== 패스포트 설정 ====//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//==== 패스포트 스트래티지 설정 ====//
var LocalStrategy = require('passport-local').Strategy;

var local_login = new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, function(req, email, password, done){
    console.log('passport의 local-login 호출됨 : ' + email + ', ' + password);

    var database = app.get('database');

    database.UserModel.findOne({'email' : email}, function(err, user){
        if(err) {return done(err)}

        // 등록된 사용자가 없는 경우
        if(!user){
            console.log('계정이 일치하지 않음.');
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
        }

        var authenticated = user.authenticate(password, user.salt, user.hashed_password);

        // 비밀번호가 틀린 경우
        if (!authenticated){
            console.log('비밀번호 일치하지 않음.');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        }

        console.log('계정과 비밀번호가 일치함.');
        return done(null, user);
    });
});

var local_signup = new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
}, function(req, email, password, done){
    // 요청 파라미터 중 name 파라미터 확인

    var paramName = req.body.name || req.query.name;
    console.log('passport의 local-signup 호출됨 : ' + email + ', ' + password + ', ' + paramName);

    // User.findOne이 blocking되므로 async 방식으로 변경할 수도 있음
    process.nextTick(function(){
        var database = app.get('database');
        database.UserModel.findOne({'email' : email}, function(err, user){
            // 오류가 발생하면
            if(err) {return done(err);}

            // 기존에 이메일이 있다면
            if(user){
                console.log('기존에 계정이 있음.');
                return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));
            } else {
                // 모델 인스턴스 객체 만들어 저장
                var user = new database.UserModel({'email' : email, 'password' : password, name : paramName});
                console.log(user)
                user.save(function(err){
                    if(err) { throw err;}
                    console.log("사용자 데이터 추가함");
                });
            }
        });
    });
});

// 패스포트 로그인 설정
passport.use('local-login', local_login);

// 패스포트 회원가입 설정
passport.use('local-signup', local_signup);

// 사용자 인증에 성공했을 때 호출
passport.serializeUser(function(user, done){
    console.log('serializeUser() 호출됨.');
    console.dir(user.email);

    done(null, user);
});

// 사용자 인증 이후 사용자 요청이 있을 때 마다 호출
passport.deserializeUser(function(user, done){
    console.log('deserializeUser() 호출됨.');
    console.dir(user.email);

    done(null, user);
});

//==== 라우팅 설정 ====//
var router = express.Router()
route_loader.init(app, router);

// 홈 화면
router.route('/').get(function(req, res){
    console.log('/ 패스 요청됨.');
    res.render('index.ejs');
});

// 로그인 폼 링크
app.get('/login', function(req, res){
    console.log('/login 패스 요청됨.');
    res.render('login.ejs', {message : req.flash('loginMessage')});
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : 'login',
    failureFlash : true
}));


// 회원가입 폼 링크
app.get('/signup', function(req, res){
    console.log('/signup 패스 요청됨.');
    res.render('signup.ejs', {message : req.flash('signupMessage')});
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
}));

// 프로필 화면
router.route('/profile').get(function(req, res){
    console.log('/profile 패스 요청됨.');

    // 인증된 경우 req.user 객체에 사용자 정보 있으며, 인증이 안 된 경우 req.user는 false 값임
    console.log('req.user 객체의 값');
    console.dir(req.user);

    // 인증이 안된 경우
    if(!req.user) {
        console.log('사용자 인증이 안 된 상태임.');
        res.redirect('/')
        return;
    }

    // 인증된 경우
    console.log('사용자 인증된 상태임.');
    if (Array.isArray(req.user)){
        res.render('profile.ejs', {user: req.user[0]});
    } else {
        res.render('profile.ejs', {user: req.user});
    }
});

// 로그아웃
app.get('/logout', function(req, res){
    console.log('/logout 패스 요청됨.');
    req.logout();
    res.redirect('/');
});



//==== 에러 컨트롤 ====//
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

//==== 서버 실행 ====//
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ', app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);
});

