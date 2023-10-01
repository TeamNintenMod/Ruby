const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')

const { community_posts } = require('../../../config.json')

const multer = require('multer')

const moment = require('moment')
const xml = require('xml')

const fetch = require('node-fetch')
const fs = require('fs')

const pako = require('pako')
const PNG = require('pngjs').PNG
const TGA = require('tga')

const headerDecoder = require('../../../other/decoder')
const { title, pid } = require('process')

const util = require('util')

const query = util.promisify(con.query).bind(con)

router.post('/', multer().none(), async (req, res) => {
    const paremPack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
    const serviceToken = req.get('x-nintendo-servicetoken')
    console.log(logger.Info(req.originalUrl))

    var app_data;
    var topic_tag;
    var search_key;
    var screenshot = "";
    var screenshotPNG;
    var painting = ""
    var paintingPNG = ""

    if (req.body.screenshot) {
        screenshot = req.body.screenshot.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()
    } else {
        screenshot = ''
        screenshotPNG = ''
    }

    if (req.body.search_key) {
        search_key = req.body.search_key
    } else {
        search_key = ''
    }

    if (req.body.app_data) {
        app_data = req.body.app_data.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim();
    } else {
        app_data = null
    }

    if (!req.body.topic_tag) {
        topic_tag = ""
    } else {
        topic_tag = req.body.topic_tag
    }

    if (req.body.painting) {
        painting = req.body.painting.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()
        paintingPNG = headerDecoder.paintingProccess(painting)
    }

    const account = req.account

    if (account.pid !== 1000000000) {

        var mii_url, sql;

        if (req.body.feeling_id == 0) {
            mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_normal_face.png`
        } else if (req.body.feeling_id == 1) {
            mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_happy_face.png`
        } else if (req.body.feeling_id == 2) {
            mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_like_face.png`
        } else if (req.body.feeling_id == 3) {
            mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_surprised_face.png`
        } else if (req.body.feeling_id == 4) {
            mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_puzzled_face.png`
        } else if (req.body.feeling_id == 5) {
            mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_frustrated_face.png`
        } else {
            mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_normal_face.png`
        }

        if (req.body.community_id == "0") {

            const community = await query(`SELECT * FROM community WHERE title_ids LIKE "%${paremPack.title_id}%"`)
            if (!JSON.stringify(community).replace('[]', '')) { res.sendStatus(404); console.log(logger.Error('Could not find a community for ' + paremPack.title_id)); return; }

            sql = `INSERT INTO post (app_data, ${(painting) ? "painting" : "body"}, ${(paintingPNG) ? "painting_png," : ""} ${(screenshot) ? "screenshot," : ""} community_id, feeling_id, is_autopost, is_spoiler, language_id, is_app_jumpable, created_at, empathy_count, number, platform_id, region_id, reply_count, title_id, country_id, topic_tag, search_key, mii, mii_face_url, screen_name, pid) VALUES ("${app_data}", ?, ${(paintingPNG) ? "'" + paintingPNG + "'," : ""} ${(screenshot) ? `"${screenshot}",` : ""} ${community[0].community_id}, ${req.body.feeling_id}, ${req.body.is_autopost}, ${req.body.is_spoiler}, ${req.body.language_id}, ${req.body.is_app_jumpable}, "${moment().format('YYYY-MM-DD HH:mm:ss')}", 0, 0, ${paremPack.platform_id}, ${paremPack.region_id}, 0, ${paremPack.title_id}, ${paremPack.country_id}, "${topic_tag}", "${search_key}", "${account[0].mii}", "${mii_url}", "${account[0].name}", ${account[0].pid})`
            await query(sql, [(painting) ? painting : req.body.body])

            console.log(logger.MySQL('Post Created!'))
            res.sendStatus(200)
        } else {
            sql = `INSERT INTO post (app_data, ${(painting) ? "painting" : "body"}, ${(paintingPNG) ? "painting_png," : ""} ${(screenshot) ? "screenshot," : ""} community_id, feeling_id, is_autopost, is_spoiler, language_id, is_app_jumpable, created_at, empathy_count, number, platform_id, region_id, reply_count, title_id, country_id, topic_tag, search_key, mii, mii_face_url, screen_name, pid) VALUES (null, ?, ${(paintingPNG) ? "'" + paintingPNG + "'," : ""} ${(screenshot) ? `"${screenshot}",` : ""} ${req.body.community_id}, ${req.body.feeling_id}, ${req.body.is_autopost}, ${req.body.is_spoiler}, ${req.body.language_id}, ${req.body.is_app_jumpable}, "${moment().format('YYYY-MM-DD HH:mm:ss')}", 0, 0, ${paremPack.platform_id}, ${paremPack.region_id}, 0, ${paremPack.title_id}, ${paremPack.country_id}, "${topic_tag}", "${req.body.search_key}", "${account[0].mii}", "${mii_url}", "${account[0].name}", ${account[0].pid})`

            const post = await query(sql, [(painting) ? painting : req.body.body])

            console.log(logger.MySQL('Post Created!'))
            res.status(200).send(`{"post_id" : ${post.insertId}}`)
        }
    } else { console.log(logger.Error("User is trying to post from an account that either doesn't exist, or that is currently banned.")); res.sendStatus(403) }
})

router.post('/:id/empathies', async (req, res) => {

    const post_id = req.params.id
    const account = req.account[0]

    if (account.pid === 1000000000) { res.sendStatus(401); return; }

    var sql = `SELECT * FROM empathies WHERE pid=? AND post_id=?`
    const is_empathy_created = await query(sql, [account.pid, post_id])

    if (!JSON.stringify(is_empathy_created).replace('[]', '')) {
        sql = `INSERT INTO empathies (post_id, pid, created_at) VALUES(?, ?, NOW())`

        await query(sql, [post_id, account.pid])
        res.sendStatus(201)
    } else {
        sql = `DELETE FROM empathies WHERE post_id=? AND pid=?`

        await query(sql, [post_id, account.pid])
        res.sendStatus(200)
    }
})

router.get('/:id/empathies', async (req, res) => {

    const empathies = await query(`SELECT * FROM empathies WHERE post_id=?`, [req.params.id])

    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(empathies))
})

module.exports = router