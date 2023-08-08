const express = require('express')
const router = express.Router()

const con = require('../../mysqlConnection')

router.get('/communites', function(req, res) {
    const limit = req.query['limit']

    if (limit) {
        con.query(`SELECT * FROM community LIMIT ${limit}`, function(err, result, fields) {
            res.send(result)
        })
    } else {
        con.query(`SELECT * FROM community`, function(err, result, fields) {
            res.send(result)
        })
    }
})

module.exports = router