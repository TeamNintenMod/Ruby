const express = require('express');

const subdomain = require('express-subdomain')

const con = require('./other/mysqlConnection')

const colors = require('colors');
const config = require("./config.json");
const mysql = require('mysql')
const { port, dbPassword } = config;
const path = require('path')
const fetch = require('node-fetch')

const fs = require('fs')

const xmlparser = require('fast-xml-parser')

const logger = require('./other/logger')

const cookieparser = require('cookie-parser')

const accountRoute = require("./routes/api/v1/people")
const communityRoute = require('./routes/api/v1/communties')
const endpointRoute = require('./routes/api/v1/endpoint')
const postsRoute = require('./routes/api/v1/posts')
const topicsRoute = require('./routes/api/v1/topics')

const setupRoute = require('./routes/portal/setup')
const titlesRoute = require('./routes/portal/titles')
const UIpostsRoute = require('./routes/portal/posts')
const usersRoute = require('./routes/portal/users')
const communitiesRoute = require('./routes/portal/communities')

const adminRoute = require('./routes/admin/admin')

const xmljs= require('xml-js');
const xml = require('xml')

const paintingProccess = require('./other/decoder')

const multer = require('multer')

const https = require('https')

const auth = require('./middleware/auth')

const util = require('util')
const query = util.promisify(con.query).bind(con)

var app = express();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://davidsosa2022.github.io, http://localhost');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'x-nintendo-servicetoken, x-nintendo-parampack, Content-Type, Accept, X-Requested-With');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
})


app.use(cookieparser())
app.use(auth)

//API
app.use('/v1/people', accountRoute)
app.use('/v1/communities', communityRoute)
app.use('/v1/endpoint', endpointRoute)
app.use('/v1/posts', postsRoute)
app.use('/v1/topics', topicsRoute)

//UI
app.use('/setup', setupRoute)
app.use('/titles', titlesRoute)
app.use('/posts', UIpostsRoute)
app.use('/users', usersRoute)
app.use('/communities', communitiesRoute)

//Admin
app.use('/admin', adminRoute)

app.use(express.static('static'))

app.set('view engine', 'ejs');
app.get('/p01/policylist/1/1/:var', (req, res) => {
    const file = fs.readFileSync('routes/api/files/UNK.xml').toString()

    res.set('Content-Type', 'text/xml')
    res.send(file)
})

app.listen(port, async () => {
    //setting sql mode to allow us to use GROUP BY
    await query("set session sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';")

    console.log(logger.Info(`Server started on port ${port}`))
})
