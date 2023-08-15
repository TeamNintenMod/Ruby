const colors = require('colors');

const config = require("../config.json");
const logger = require('./logger');

const mysql = require('mysql');

const { port, mysqlhost, mysqluser, mysqlpassword, mysqldatabase } = config;

var con = mysql.createConnection({
    host: mysqlhost,
    user : mysqluser,
    password : mysqlpassword,
    database : mysqldatabase
})

con.connect((err) => {
    if (err) { throw err }
    console.log(logger.MySQL('Connected to Database!'))
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = con
