var database;
var UserSchema;
var UserModel;

// 데이터베이스 객체, 스키마 객체, 모델 객체를 이 모듈에서 사용할 수 있도록 전달함
var init = function(db, schema, model){
    console.log('init 호출됨.');

    database = db;
    UserSchema = schema;
    UserModel = model;
}

// process/login 라우팅
var login = function(req, res){
    console.log('user 모듈 안에 있는 login 호출됨.');

    var paramId = req.param('id');
    var paramPassword = req.param('password');

    // 데이터베이스 객체 참조
    var database = req.app.get('database');

    if(database){
        authUser(database, paramId, paramPassword, function(err, docs){
            if(err) throw err;

            if(docs){
                console.dir(docs);
                var username = docs[0].name;
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                // 뷰 템플릿을 사용하여 렌더링한 후 전송
                var context = {userid:'jjang01', username:'짱구'};
                req.app.render('login_success', context, function(err, html){
                    if(err){
                        console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>뷰 렌더링 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    console.log('rendered : ' + html);

                    res.end(html);
                });
            } else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
                res.write('<br><br><a href=/ch06/public/login.html>다시 로그인하기</a>');
                res.end();
            }
        });
    } else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
    }
}

// process/adduser 라우팅
var adduser = function(req, res){
    console.log('user 모듈 안에 있는 adduser 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);

    // 데이터베이스 객체 참조
    var database = req.app.get('database');

    if(database){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if (err) throw err;
            // 결과 객체가 있으면 성공 응답
            if(result){
                console.dir(result);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                var context = {title:'사용자 추가 성공'};
                req.app.render('adduser', context, function(err, html) {
                    if (err) {
                        console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>뷰 렌더링 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }

                    console.log("rendered : " + html);

                    res.end(html);
                });

            } else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    } else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}

// process/listuser 라우팅
var listuser = function(req, res){
    console.log('user 모듈 안에 있는 listuser 호출됨.');

    // 데이터베이스 객체 참조
    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
    if(database){
        // 1. 모든 사용자 검색
        database.UserModel.findAll(function(err, results){
            if(err){
                console.err('사용자 리스트 조회 중 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if(results){ //결과 객체가 있으면 리스트 전송
                console.dir(results);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                var context = {results:results};
                req.app.render('listuser', context, function(err, html) {
                    if (err) {
                        console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>뷰 렌더링 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    console.log('rendered : ' + html);

                    res.end(html);
                });
            } else{ //결과 객체가 없으면 실패 응답 전송
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 실패</h2>');
                res.end();
            }
        });
    } else { // 데이터베이스 객체가 초기화되지 않았을 때 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}


// 사용자를 추가하는 함수
var addUser = function(database, id, password, name, callback){
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);

    // UserModel의 인스턴스 생성
    var user = new database.UserModel({'id': id, 'password': password, 'name': name});

    // save()로 저장
    user.save(function(err){
        if(err){
            callback(err, null);
            return;
        }
        console.log('사용자 데이터 추가함');
        callback(null, user);
    });
};

// 사용자를 인증하는 함수
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨. : ' + id + ', ' + password);

    // 1. 아이디를 사용해 검색
    database.UserModel.findById(id, function(err, results){
        if(err){
            callback(err, null);
            return;
        }

        console.log('아이디 [%s]로 사용자 검색 결과', id);
        console.dir(results);

        if(results.length>0) {
            console.log('아이디와 일치하는 사용자 찾음.');

            //2. 비밀번호 확인 : 모델 인스턴스 객체를 만들고 authenticate() 메소드 호출
            var user = new database.UserModel({id : id});
            var authenticated = user.authenticate(password, results[0].salt, results[0].hashed_password);

            if(authenticated){
                console.log('비밀번호 일치함');
                callback(null, results);
            } else{
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }

        } else{
            console.log('아이디와 일치하는 사용자를 찾지 못함.');
            callback(null, null);
        }

    });
};

module.exports.init = init;
module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;
