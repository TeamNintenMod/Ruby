const express = require('express')
const router = express.Router()

const con = require('../../mysqlConnection')

router.get('/accounts', function(req, res) {
    con.query("SELECT id, create_time, nnid, name FROM account", function (err, result, fields) {
        console.log(`[MYSQL] Requested All Accounts`)
        res.send(result)
    })
})

router.post('/accounts', function(req, res) {

    const nnid = req.get('nnid')
    const password = req.get('password')
    const token = req.get('token')

    con.query(`INSERT INTO account (nnid, name, password, token) VALUES ("${nnid}", "${nnid}", "${password}", "${token}")`, function (err, result, fields) {
        if (err) throw {err}
        console.log(`[MYSQL] Created new account ${nnid}, ${password}`.blue)
        res.sendStatus(200)
    })
})

router.get('/account', function(req, res) {
    const nnid = req.query["nnid"]

    con.query(`SELECT id, create_time, nnid, name FROM account WHERE nnid="${nnid}"`, function (err, result, fields) {
        console.log(`[MYSQL] Requested "${nnid}"`.blue)
        res.send(result)
    })
})

router.get('/accountsignin', function(req, res) {
    const nnid = req.header('nnid')
    const password = req.header('password')

    console.log(`[GET] Sign In Request. [ ${nnid}, ${password} ]`)

    con.query(`SELECT * FROM account WHERE nnid="${nnid}"`, function (err, result, field) {
        if (err) { throw err}
        console.log(`[MYSQL] Check 1 [${result[0].nnid}, ${result[0].password}]`.blue)

        if (password == result[0].password) {
            console.log(`[LOGIN] Correct login attempt!`.cyan)
            res.send(result[0].token)
        } else {
            console.log(`[LOGIN] Incorrect login attempt by ${req.ip}`.red)
            res.sendStatus(404)
        }
    })
})

module.exports = router