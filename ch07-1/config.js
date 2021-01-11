
module.exports = {

    server_port : 3000,

    db_url : 'mongodb://localhost:27017/local',
    db_schemas: [
        {file:'./user_schema', collection:'users3', schemaName:'UserShema',
        modelName:'UserModel'}
    ],

    route_info : [
        {file: './user', path: '/process/login', method: 'login', type: 'post'},
        {file: './user', path: '/process/adduser', method: 'adduser', type: 'post'},
        {file: './user', path: '/process/listuser', method: 'listuser', type: 'post'}
    ]
}