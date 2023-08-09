const express = require('express')
const router = express.Router()

const con = require('../../mysqlConnection')

const moment = require('moment')

router.get('/', function(req, res) {
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

router.get('/0/posts/', function(req, res) {
    const limit = req.query['limit']

    if (limit) {
        con.query('SELECT * FROM post ORDER BY `id` desc LIMIT ' + limit, function (err, result, fields) {
            if (err) { throw err  }
            res.send(result)
        })
    } else {
        con.query(`SELECT * FROM post`, function (err, result, fields) {
            res.send(result)
        })
    }
})

router.post('/0/posts', function(req, res) {
    const nnid = req.get('nnid')
    const password = req.get('password')
    const token = req.get('token')
    const content = req.get('content')

    console.log(nnid, password, token, content)

    con.query(`SELECT * FROM account WHERE token='${token}'`, function(err, result, fields) {
        if (err) throw {err}
        console.log(result)

        try {
            const miiUrl = `http://mii-images.account.nintendo.net/${result[0].miiHash}_normal_face.png`

            const date = moment().format("YYYY-MM-DD HH:mm:ss")

            con.query(`INSERT INTO post (create_time, content, userId, nnid, miiUrl) VALUES ("${date}", "${content}", "${result[0].id}", "${result[0].nnid}", "${miiUrl}")`, function(err, result, fields) {
                if (err) throw {err}
        
                console.log("[MYSQL] Created new post!".blue)
                res.sendStatus(200)
            })
        } catch (error) {
            console.log(error)
            res.sendStatus(403)
        }
    })
})

module.exports = router