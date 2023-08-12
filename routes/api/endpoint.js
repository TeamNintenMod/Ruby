const express = require('express')
const router = express.Router()

const path = require('path')

const con = require('../../other/mysqlConnection')
const logger = require('../../other/logger')

router.get('/', function(req, res) {
    res.set('Content-Type', 'text/xml')
    res.sendFile(path.join(__dirname, '/discovery.xml'))

    console.log(logger.Get(req.originalUrl))
})

module.exports = router