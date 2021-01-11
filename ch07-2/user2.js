// exports 전역 변수가 아닌 exports 변수에 객체가 할당되어
// 모듀로 참조할 수 없음
exports = {
    getUser : function(){
        return {id : 'test01', name : '소녀시대'};
    },
    group: {id : 'group01', name : '친구'}
}

// module.exports = exports
// exports 전역변수에 객체들을 속성으로 할당