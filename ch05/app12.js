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

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}));

// body-parser 를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));


app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

// 상품정보 라우팅 함수
router.route('/process/product').get(function(req, res){
    console.log('/process/product 호췰됨');
    
    if(req.session.user){
        res.redirect('/public/product.html');
    }else{
        res.redirect('/public/login2.html');
    }
});

// 로그인 라우팅 함수 - 로그인 후 세션 저장함
router.route('/process/login').post(function(req,res){
    console.log('/process/login 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    
    if(req.session.user){
        // 이미 로그인된 상태
        console.log('이미 로그인되어 상품 페이지로 이동');
        res.redirect('/public/product.html');
    }else{
        // 세션 저장
        req.session.user = {
            id: paramId,
            name: '최유정',
            authourized: true
        };
        
    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>로그인 성공</h1>');
    res.write('<div><p>paramId : ' + paramId + '</p></div>');
    res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
    res.write("<br><br><a href='/process/product'>상품 페이지로 이동하기</a>");
    res.end();
    }
});

// 로그아웃 라우팅 함수 - 로그아웃 후 세션 삭제함
router.route('/process/logout').get(function(req,res){
    console.log('/process/logout 호출됨');
    
    if(req.session.user){
        // 로그인 된 상태
        console.log('로그아웃합니다.');
        req.session.destroy(function(err){
            if(err) {throw err;}
            
            console.log('세션을 삭제하고 로그아웃되었습니다.');
            res.redirect('/public/login2.html');
        });
   }else{
       // 로그인 안된 상태
       console.log('아직 로그인되어 있지 않습니다.');
       res.redirect('/public/login2.html');
   }
});


app.use('/', router);

app.all('*', function(req, res){
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
})

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});