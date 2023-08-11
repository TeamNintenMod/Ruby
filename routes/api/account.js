const express = require('express')
const router = express.Router()

const con = require('../../mysqlConnection')

const moment = require('moment')

const { placeholderBio } = require('../../config.json')

router.get('/', function(req, res) {
    con.query("SELECT id, create_time, nnid, name, bio, admin, miiHash FROM account", function (err, result, fields) {
        console.log(`[MYSQL] Requested All Accounts`)
        res.send(result)
    })
})

router.post('/', function(req, res) {

    const nnid = req.get('nnid')
    const password = req.get('password')
    const token = req.get('token')

    console.log("POST")

    fetch(`https://nnidlt.murilo.eu.org/api.php?env=production&user_id=${nnid}`)
        .then(response => response.json()).then((response) => {

            console.log(response)

            const hash = response.images.hash
            const name = response.name

            const date = moment().format("YYYY-MM-DD HH:mm:ss")

            con.query(`INSERT INTO account (create_time, nnid, name, bio, miiHash, password, token) VALUES ("${date}", "${nnid}", "${name}", "${placeholderBio}", "${hash}", "${password}", "${token}")`, function (err, result, fields) {
                if (err) throw {err}
                console.log(`[MYSQL] Created new account with ${nnid} and ${password}`.blue)
                res.sendStatus(200)
            })
        })
})

router.get('/person', function(req, res) {
    const nnid = req.query["nnid"]

    con.query(`SELECT id, create_time, nnid, name, bio, admin, miiHash FROM account WHERE nnid="${nnid}"`, function (err, result, fields) {
        console.log(`[MYSQL] Requested "${nnid}"`.blue)
        res.send(result)
    })
})

router.get('/signin', function(req, res) {
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