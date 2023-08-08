const colors = require('colors');
const config = require("./config.json");
const mysql = require('mysql')
const { port, mysqlhost, mysqluser, mysqlpassword, mysqldatabase } = config;

var con = mysql.createConnection({
    host: mysqlhost,
    user : mysqluser,
    password : mysqlpassword,
    database : mysqldatabase
})

con.connect((err) => {
    if (err) { throw err }
    console.log("[MYSQL] Connected to database.".blue)
})

module.exports = con
