var fs = require('fs');

fs.open('./address.txt', 'r', function(err, fd){
    if(err) throw err;
    
    var buf = new Buffer(400);
    
    fs.read(fd, buf, 0, buf.length, null, function(err, fd, buf){
        if(err) throw err;
        
        var inStr = buf.toString('utf8', 0, fd);
        var rowStr = inStr.split('\n');
        
        for(var i in rowStr){
            var colStr = rowStr[i].split(' ', 1);
            console.log('%s',colStr[0]
                       );    
        }
        
        fs.close(fd, function(){});
    });
});