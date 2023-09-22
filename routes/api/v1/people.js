const express = require('express')
const router = express.Router()

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')
const config = require('../../../config.json')

const moment = require('moment')

const { placeholderBio } = config

const fetch = require('node-fetch')

router.post('/', (req, res) => {
    console.log(logger.Info(req.originalUrl))

    const serviceToken = req.get('x-nintendo-servicetoken').slice(0, 42)
    const nnid = req.get('NNID')

    console.log(logger.MySQL(`Creating New Account For ${nnid}`))

    con.query(`SELECT * FROM account WHERE nnid="${nnid}"`, function (err, result, fields) {
        if (err) { throw err }

        console.log(result)

        if (JSON.stringify(result).replace('[]', '')) {
            console.log(logger.Error(`There has already been an account created for ${nnid}`))
            res.send('{ success : 0 }')
        } else {
            fetch(`https://nnidlt.murilo.eu.org/api.php?env=production&user_id=${nnid}`).then(response => response.text()).then(response => {
                const responseObject = JSON.parse(response)

                con.query(`INSERT INTO account (nnid, serviceToken, name, bio, admin, pid, mii, hash, banned, favorited_communities) VALUES("${responseObject.user_id}", "${serviceToken}", "${responseObject.name}", "${config.placeholderBio}", 0, ${responseObject.pid}, "${responseObject.data}", "${responseObject.images.hash}", 0, "[]");`, function (err, result, fields) {
                    if (err) {throw err} else {
                        console.log(logger.MySQL('Account Created!'))
                        res.sendStatus(201)
                    }   
                })

            })
        }
    })
})

router.get('/', (req, res) => {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <result>
      <has_error>0</has_error>
      <version>1</version>
      <request_name>people</request_name>
      <topic>
        <community_id>6</community_id>
      </topic>
      <people>
      <person>
      <posts>
        <post>
          <app_data></app_data>
          <body>Hello all! This is a test of v1/people..</body>
          <community_id>23</community_id>
          <country_id>49</country_id>
          <created_at>2018-02-25 03:23:06</created_at>
          <feeling_id>0</feeling_id>
          <id>AYYGAABB9WcligYJs4whmA</id>
          <is_autopost>0</is_autopost>
          <is_community_private_autopost>0</is_community_private_autopost>
          <is_spoiler>0</is_spoiler>
          <is_app_jumpable>1</is_app_jumpable>
          <empathy_count>9999</empathy_count>
          <language_id>1</language_id>
          <mii>AwAAQEp1suGiJbAC3DXFNXg5ODM4EQAAomNOAG8AUABuAGkAZAAAAAAAAAAAAGIqAJBCARFoRBgpFEYUgRIXaA0AACkAUkhUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPfy</mii>
          <mii_face_url>http://example.com/image.tga</mii_face_url>
          <number>784327</number>
          <pid>1754471381</pid>
          <platform_id>1</platform_id>
          <region_id>2</region_id>
          <reply_count>9999</reply_count>
          <screen_name>NoPnid</screen_name>
          <title_id>1407375153045248</title_id>
        </post>
      </posts>
      </person>
      <person>
      <posts>
        <post>
          <app_data></app_data>
          <body>I love TVii</body>
          <community_id>23</community_id>
          <country_id>49</country_id>
          <created_at>2018-02-25 03:23:06</created_at>
          <feeling_id>0</feeling_id>
          <id>AYYGAABB9WcligYJs4whmA</id>
          <is_autopost>0</is_autopost>
          <is_community_private_autopost>0</is_community_private_autopost>
          <is_spoiler>1</is_spoiler>
          <is_app_jumpable>1</is_app_jumpable>
          <empathy_count>0</empathy_count>
          <language_id>1</language_id>
          <mii>AwEAQBs8xqsHR9PC3DrqBYXEaBemLwAAVllEAGEAdgBpAGQAIABKAG8AYQBxAGJaABAyAAJoRBgGNEYUgRIZaA0AACkAUmdQRAAuAFMAAABkACAAUwBvAHMAYQAAALCc</mii>
          <mii_face_url>http://example.com/image.tga</mii_face_url>
          <number>124</number>
          <pid>1739044112</pid>
          <platform_id>1</platform_id>
          <region_id>2</region_id>
          <reply_count>0</reply_count>
          <screen_name>David Joaq</screen_name>
          <title_id>1407581310496778</title_id>
        </post>
      </posts>
      </person>
      </people>
    </result>`)
})



module.exports = router