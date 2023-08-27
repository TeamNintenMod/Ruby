const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../other/mysqlConnection')
const logger = require('../../other/logger')

const { community_posts } = require('../../config.json')

const multer = require('multer')

const moment = require('moment')
const xml = require('xml')

const fetch = require('node-fetch')

router.post('/', multer().none(), (req, res) => {
    const headerDecoder = require('../../other/headerDecoder')
    const paremPack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
    const serviceToken = req.get('x-nintendo-servicetoken')
    console.log(logger.Info(req.originalUrl))

    if (!req.query['applet'] == 1) {

        var app_data;

        if (req.body.app_data) {
            app_data = req.body.app_data.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim();
        }
        

        fetch(`https://olvapi.nonamegiven.xyz/v1/people/person?token=${serviceToken.slice(0, 42)}`).then(response => response.text()).then(result => {
            if (result.replace('[]', "")) {
    
                const account = JSON.parse(result)
    
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
    
                const sql = `INSERT INTO post (app_data, body, community_id, feeling_id, is_autopost, is_spoiler, language_id, is_app_jumpable, created_at, empathy_count, number, platform_id, region_id, reply_count, title_id, country_id, topic_tag, search_key, mii, mii_face_url, screen_name, pid) VALUES ("${app_data}", "${req.body.body}", ${paremPack.title_id}, ${req.body.feeling_id}, ${req.body.is_autopost}, ${req.body.is_spoiler}, ${req.body.language_id}, ${req.body.is_app_jumpable}, "${moment().format('YYYY-MM-DD hh:mm:ss')}", 0, 0, ${paremPack.platform_id}, ${paremPack.region_id}, 0, ${paremPack.title_id}, ${paremPack.country_id}, "${req.body.topic_tag}", "${req.body.search_key}", "${account[0].mii}", "${mii_url}", "${account[0].name}", ${account[0].pid})`
    
                con.query(sql, (err, result, fields) => {
                    if (err) {console.log(logger.Error(err)); res.sendStatus(404);} else {
                        console.log(logger.MySQL('Post Created!'))
                        res.sendStatus(200)
                    }
                })
    
            } else { console.log('Died XD'); res.sendStatus(404) }
        }); 
    } else {
        const json = JSON.parse(req.get('BODY'))

        const { body, title_id, feeling_id, is_spoiler } = json

        fetch(`https://olvapi.nonamegiven.xyz/v1/people/person?token=${serviceToken.slice(0, 42)}`).then(response => response.text()).then(result => {
            if (result.replace('[]', "")) {

                const account = JSON.parse(result)

                var mii_url;

                if (feeling_id == 0) {
                    mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_normal_face.png`
                } else if (feeling_id == 1) {
                    mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_happy_face.png`
                } else if (feeling_id == 2) {
                    mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_like_face.png`
                } else if (feeling_id == 3) {
                    mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_surprised_face.png`
                } else if (feeling_id == 4) {
                    mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_puzzled_face.png`
                } else if (feeling_id == 5) {
                    mii_url = `http://mii-images.account.nintendo.net/${account[0].hash}_frustrated_face.png`
                }

                const sql = `INSERT INTO post (body, community_id, feeling_id, is_autopost, is_spoiler, language_id, created_at, empathy_count, number, platform_id, region_id, reply_count, title_id, country_id, mii, mii_face_url, screen_name, pid, is_community_private_autopost, is_app_jumpable) VALUES 
                ("${body}",${title_id}, ${feeling_id}, 0, ${is_spoiler}, ${paremPack.language_id}, "${moment().format('YYYY-MM-DD hh:mm:ss')}", 0, 0, ${paremPack.platform_id}, ${paremPack.region_id}, 0, ${title_id}, ${paremPack.country_id}, "${account[0].mii}", "${mii_url}", "${account[0].name}", ${account[0].pid}, 0, 0)`

                con.query(sql, (err, result, fields) => {
                    if (err) {console.log(logger.Error(err)); res.sendStatus(404);} else {
                        console.log(logger.MySQL('Post Created!'))
                        res.sendStatus(200)
                    }
                })
            } else { console.log('Died XD'); res.sendStatus(404) }
        }); 
    }
})

module.exports = router