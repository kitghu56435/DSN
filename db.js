const mysql = require('mysql2');

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'UIH)Ow(iqee$21',
    database : 'dsn'
})



module.exports = db;
