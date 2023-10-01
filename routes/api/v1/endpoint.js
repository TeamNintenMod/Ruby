const express = require('express')
const router = express.Router()

const path = require('path')

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')

const config = require('../../../config.json')

const {host, api_host, portal_host, n3ds_host} = config

const xmlbuilder = require('xmlbuilder')

router.get('/', function(req, res) {
    var xml;
    
    xml = xmlbuilder.create('result', {version : '1.0', encoding : 'UTF-8'})
        .ele('has_error').txt('0').up()
        .ele('version', '1').up()
        .ele('endpoint')
            .ele('host', host).up()
            .ele('api_host', api_host).up()
            .ele('portal_host', portal_host).up()
            .ele("n3ds_host", n3ds_host).up()
        .up()
    .end({pretty : true, allowEmpty : true})

    res.header('Content-Type', 'application/xml')
    res.setHeader('Connection', 'close')
    res.send(`${xml}`)
    res.statusCode = 200
    res.end()
    res.connection.end()
})

module.exports = router