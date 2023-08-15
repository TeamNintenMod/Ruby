const express = require('express');
const colors = require('colors');
const config = require("./config.json");
const mysql = require('mysql')
const { port, dbPassword } = config;
const path = require('path')

const fs = require('fs')

const xmlparser = require('fast-xml-parser')

const logger = require('./other/logger')

const cookieparser = require('cookie-parser')

const accountRoute = require("./routes/api/account")
const pagesRoute = require('./routes/pages')
const communityRoute = require('./routes/api/communties')
const endpointRoute = require('./routes/api/endpoint');
const xmljs= require('xml-js');
const xml = require('xml')

const subdomain = require('express-subdomain')

const key = fs.readFileSync('./certs/key.pem');

const cert = fs.readFileSync('./certs/cert.pem');

const https = require('https')

var app = express();

app.use(cookieparser())

app.use('/v1/people', accountRoute)
app.use('/v1/communities', communityRoute)
app.use('/v1/endpoint', endpointRoute)

app.use('/pages', pagesRoute)

app.use(express.static('static'))

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    console.log(logger.Get(req.originalUrl))

    const parser = new xmlparser.XMLParser();

    fetch('http://localhost:80/v1/communities').then(response => response.text()).then((xmlResult) => {
        const xmlFinal = parser.parse(xmlResult)

        res.render('./pages/index.ejs', {
            data : xmlFinal.result.communities
        })
    });

    
})

app.listen(port, () => {
    console.log(logger.Info('Server started on port 80.'))
})
