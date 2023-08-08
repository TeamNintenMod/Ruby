const express = require('express')
const router = express.Router()

const path = require('path')

const con = require('../../mysqlConnection')

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/discovery.xml'))
})

module.exports = router