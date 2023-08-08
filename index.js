const express = require('express');
const colors = require('colors');
const config = require("./config.json");
const mysql = require('mysql')
const { port, dbPassword } = config;
const path = require('path')

const cookieparser = require('cookie-parser')

const accountRoute = require("./routes/api/account")
const postRoute = require('./routes/api/posts')
const pagesRoute = require('./routes/pages')
const communityRoute = require('./routes/api/communties')

var app = express();

app.use(cookieparser())

app.use('/api/account', accountRoute)
app.use('/api/post', postRoute)
app.use('/api/community', communityRoute)

app.use('/pages', pagesRoute)

app.use(express.static('static'))

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

