var express = require('express')
    , http = require('http')
    , path = require('path');

var static = require('serve-static');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use('/public', static(path.join(__dirname, 'public')));

//==== 서버 실행 ====//
const httpServer = http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ', app.get('port'));
});

//==== 채팅 서버 ====//
const io = require("socket.io")(httpServer);
console.log('socket.io 요청을 받아들일 준비가 되었습니다.');

// 클라이언트가 연결했을 때의 이벤트 처리
io.on("connection", (socket) => {
    console.log('connection info : ', socket.request.connection._peername);

    // step2. 클라이언트 소켓에서 해당 이벤트를 호출
    // 'message' 이벤트를 받았을 때의 처리
    socket.on('messageS', (message) => {
        console.dir(message);
        console.log('message 이벤트를 받았습니다.');

        if(message.recepient === 'ALL'){
            // 나를 포함한 모든 클라이언트에게 메시지 전달
            console.dir('나를 포함한 모든 클라이언트에게 message 이벤트를 전송합니다.');
            // step3. 연결된 모든 클라이언트 소켓에 messageC 이벤트를 호출
            io.sockets.emit('messageC', message);
        }
    });
});