const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../other/mysqlConnection')
const logger = require('../../other/logger')

const { community_posts } = require('../../config.json')

const multer = require('multer')

const moment = require('moment')
const xml = require('xml')

router.post('/', multer().none(), (req, res) => {
    const headerDecoder = require('../../other/headerDecoder')
    const paremPack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
    console.log(logger.Info(req.originalUrl))

    const sql = `INSERT INTO post (app_data, body, community_id, feeling_id, is_autopost, is_spoiler, language_id, is_app_jumpable, created_at, empathy_count, number, platform_id, region_id, reply_count, title_id, country_id, topic_tag, search_key) VALUES ('${req.body.app_data}', '${req.body.body}', ${paremPack.title_id}, ${req.body.feeling_id}, ${req.body.is_autopost}, ${req.body.is_spoiler}, ${req.body.language_id}, ${req.body.is_app_jumpable}, "${moment().format('YYYY-MM-DD hh:mm:ss')}", 0, 0, ${paremPack.platform_id}, ${paremPack.region_id}, 0, ${paremPack.title_id}, ${paremPack.country_id}, "${req.body.topic_tag}", "${req.body.search_key}")`

    
    con.query(sql, (err, result, fields) => {
        if (err) {console.log(logger.Error(err)); res.sendStatus(404);} else {
            console.log(logger.MySQL('Post Created!'))
            res.sendStatus(200)
        }
    })


})

module.exports = router