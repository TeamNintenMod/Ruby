const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')

const { community_posts } = require('../../../config.json')

const multer = require('multer')
const auth = require('../../../other/auth')

const moment = require('moment')
const xml = require('xml')

const fetch = require('node-fetch')
const fs = require('fs')

const pako = require('pako')
const PNG = require('pngjs').PNG
const TGA = require('tga')

const headerDecoder = require('../../../other/decoder')
const { title } = require('process')

router.post('/', multer().none(), async (req, res) => {
    const paremPack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
    const serviceToken = req.get('x-nintendo-servicetoken')
    console.log(logger.Info(req.originalUrl))

    console.log(req.body.community_id)

    if (!req.query['applet'] == 1) {

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

        const account = JSON.parse(await auth.authenticateUser(serviceToken.slice(0, 42)))

        if (account) {

            var mii_url;

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
            }

            if (req.body.community_id == "0") {
                con.query(`SELECT * FROM community WHERE title_ids LIKE "%${paremPack.title_id}%"`, (err, result, fields) => {
                    const sql = `INSERT INTO post (app_data, ${(painting) ? "painting" : "body"}, ${(paintingPNG) ? "painting_png," : ""} ${(screenshot) ? "screenshot," : ""} community_id, feeling_id, is_autopost, is_spoiler, language_id, is_app_jumpable, created_at, empathy_count, number, platform_id, region_id, reply_count, title_id, country_id, topic_tag, search_key, mii, mii_face_url, screen_name, pid)
                        VALUES ("${app_data}", "${(painting) ? painting : req.body.body}", ${(paintingPNG) ? "'" + paintingPNG + "'," : ""} ${(screenshot) ? `"${screenshot}",` : ""} ${result[0].community_id}, ${req.body.feeling_id}, ${req.body.is_autopost}, ${req.body.is_spoiler}, ${req.body.language_id}, ${req.body.is_app_jumpable}, "${moment().format('YYYY-MM-DD hh:mm:ss')}", 0, 0, ${paremPack.platform_id}, ${paremPack.region_id}, 0, ${paremPack.title_id}, ${paremPack.country_id}, "${topic_tag}", "${search_key}", "${account[0].mii}", "${mii_url}", "${account[0].name}", ${account[0].pid})`
                        
                    con.query(sql, (err, result, fields) => {
                        if (err) { console.log(logger.Error(err)); res.sendStatus(404); } else {
                            console.log(logger.MySQL('Post Created!'))
                            res.sendStatus(200)
                        }
                    })
                })
            } else {
                const sql = `INSERT INTO post (app_data, ${(painting) ? "painting" : "body"}, ${(paintingPNG) ? "painting_png," : ""} ${(screenshot) ? "screenshot," : ""} community_id, feeling_id, is_autopost, is_spoiler, language_id, is_app_jumpable, created_at, empathy_count, number, platform_id, region_id, reply_count, title_id, country_id, topic_tag, search_key, mii, mii_face_url, screen_name, pid)
                        VALUES ("${app_data}", "${(painting) ? painting : req.body.body}", ${(paintingPNG) ? "'" + paintingPNG + "'," : ""} ${(screenshot) ? `"${screenshot}",` : ""} ${req.body.community_id}, ${req.body.feeling_id}, ${req.body.is_autopost}, ${req.body.is_spoiler}, ${req.body.language_id}, ${req.body.is_app_jumpable}, "${moment().format('YYYY-MM-DD hh:mm:ss')}", 0, 0, ${paremPack.platform_id}, ${paremPack.region_id}, 0, ${paremPack.title_id}, ${paremPack.country_id}, "${topic_tag}", "${req.body.search_key}", "${account[0].mii}", "${mii_url}", "${account[0].name}", ${account[0].pid})`

                con.query(sql, (err, result, fields) => {
                    if (err) { console.log(logger.Error(err)); res.sendStatus(404); } else {
                        console.log(logger.MySQL('Post Created!'))
                        res.sendStatus(200)
                    }
                })
            }


        } else { console.log('Died XD'); res.sendStatus(404) }
    }
})

router.post('/:id/empathies', async (req, res) => {

    const account = JSON.parse(await auth.authenticateUser(req.get('x-nintendo-servicetoken')))[0]

    if (account) {
        const id = req.params.id
        var yeahed_posts;

        if (!account.yeahed_posts) {
            yeahed_posts = []
            console.log('doesnt already has yeahed posts')
        } else {
            yeahed_posts = JSON.parse(account.yeahed_posts)
        }

        console.log()

        if (yeahed_posts.includes(Number(id))) {
            res.sendStatus(403)
        } else {
            const addEmpathy = `UPDATE post SET empathy_count=empathy_count+1 WHERE id=${id}`

            con.query(addEmpathy, (err, result, fields) => {
                if (err) throw { err }

                console.log(logger.MySQL("Added empathy to post " + id))

                yeahed_posts.push(Number(id))

                const userSQL = `UPDATE account SET yeahed_posts="${JSON.stringify(yeahed_posts)}" WHERE serviceToken="${req.get('x-nintendo-servicetoken').slice(0, 42)}"`

                con.query(userSQL, (err, result, fields) => {
                    if (err) throw { err }
                    console.log(logger.MySQL("Added empathy to user."))

                    res.sendStatus(200)
                })
            })
        }
    } else {
        res.sendStatus(403)
    }
})

router.delete('/:id/empathies', async (req, res) => {
    const account = JSON.parse(await auth.authenticateUser(req.get('x-nintendo-servicetoken')))[0]

    if (account) {
        var yeahed_posts
        const id = req.params.id

        if (!account.yeahed_posts) {
            res.sendStatus(403)
        } else {
            var yeahed_posts = JSON.parse(account.yeahed_posts)
        }

        const removeEmpathy = `UPDATE post SET empathy_count=empathy_count-1 WHERE id=${id}`

        con.query(removeEmpathy, (err, result, fields) => {
            if (err) { throw err }

            console.log(logger.MySQL("Removed empathy from post " + id))

            yeahed_posts.splice(yeahed_posts.indexOf(`${id}`), 1)

            const userSQL = `UPDATE account SET yeahed_posts="${JSON.stringify(yeahed_posts)}" WHERE serviceToken="${req.get('x-nintendo-servicetoken').slice(0, 42)}"`

            con.query(userSQL, (err, result, fields) => {
                if (err) { throw err }

                res.sendStatus(200)
            })
        })
    } else {
        res.sendStatus(403)
    }
})

module.exports = router