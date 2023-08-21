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

const accountRoute = require("./routes/api/account")
const titlesRoute = require('./routes/titles')
const communityRoute = require('./routes/api/communties')
const endpointRoute = require('./routes/api/endpoint')
const postsRoute = require('./routes/api/posts')
const xmljs= require('xml-js');
const xml = require('xml')

const subdomain = require('express-subdomain')

const multer = require('multer')

const https = require('https')

var app = express();

app.use(cookieparser())

app.use('/v1/people', accountRoute)
app.use('/v1/communities', communityRoute)
app.use('/v1/endpoint', endpointRoute)
app.use('/v1/posts', postsRoute)
app.use('/miiverse/xml', endpointRoute)

app.use('/titles', titlesRoute)

app.use(express.static('static'))

app.set('view engine', 'ejs');

const testHtml = fs.readFileSync('./testHTML.html')

app.get('/titles/show', (req, res) => {
    console.log(logger.Get(req.originalUrl))

    const parser = new xmlparser.XMLParser();

    fetch('https://olvapi.nonamegiven.xyz/v1/communities').then(response => response.text()).then((xmlResult) => {
        const xmlFinal = parser.parse(xmlResult)

        res.render('./pages/index.ejs', {
            data : xmlFinal.result.communities
        })
    });
})

app.get('/titles/first', (req, res) => {
    console.log(logger.Get(req.originalUrl))
})

app.get('/titles/newUser', (req, res) => {
    console.log(logger.Get(req.originalUrl))
})

app.get('/titles', (req, res) => {
    console.log(logger.Get(req.originalUrl))
})

app.get('/', (req, res) => {
    console.log(logger.Get(req.originalUrl))
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(logger.Info('Server started on port 80.'))
})
