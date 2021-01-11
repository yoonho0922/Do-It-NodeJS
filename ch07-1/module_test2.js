// exports 전역 변수가 아닌 exports 변수에 객체가 할당되어
// 모듀로 참조할 수 없음 -> 에러
var user = require('./user2');

console.dir(user);

function showUser(){
    return user.getUser().name + ', ' + user.group.name;
}

console.log(showUser());