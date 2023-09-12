const express = require('express');
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
const titlesRoute = require('./routes/titles')
const communityRoute = require('./routes/api/v1/communties')
const endpointRoute = require('./routes/api/v1/endpoint')
const postsRoute = require('./routes/api/v1/posts')
const xmljs= require('xml-js');
const xml = require('xml')

const paintingProccess = require('./other/decoder')

const subdomain = require('express-subdomain')

const multer = require('multer')

const https = require('https')

var app = express();

app.use(cookieparser())

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://davidsosa2022.github.io');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'x-nintendo-servicetoken, x-nintendo-parampack, Content-Type, Accept, X-Requested-With');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
})

app.use('/v1/people', accountRoute)
app.use('/v1/communities', communityRoute)
app.use('/v1/endpoint', endpointRoute)
app.use('/v1/posts', postsRoute)
app.use('/miiverse/xml', endpointRoute)
app.use('/titles', titlesRoute)

app.use(express.static('static'))

app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log(logger.Info('Server started on port 80.'))
})
