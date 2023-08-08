const express = require('express');
const colors = require('colors');
const config = require("./config.json");
const mysql = require('mysql')
const { port, dbPassword } = config;

const cookieparser = require('cookie-parser')

const accountRoute = require("./routes/api/account")
const postsRoute = require('./routes/api/posts')
const pagesRoute = require('./routes/pages')

var app = express();

app.use(cookieparser())
app.use('/api/account', accountRoute)
app.use('/api/post', postsRoute)
app.use('/pages', pagesRoute)

app.set('view engine', 'ejs');

app.get('/signUp', function(req, res) {
    res.render('./pages/signs/signUp.ejs')
})

app.get('/signin', function(req, res) {
    console.log(req.ip)
    res.render('./pages/signs/signIn.ejs')
})

app.listen(port, () => {
    console.log(`[INFO] Server started on port ${port}.`.green)
})

