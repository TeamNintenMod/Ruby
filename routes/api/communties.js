const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../other/mysqlConnection')
const logger = require('../../other/logger')

const { community_posts } = require('../../config.json')

const moment = require('moment')
const xmlbuilder = require('xmlbuilder')
const headerDecoder = require('../../other/headerDecoder')
const multer = require('multer')

const fetch = require('node-fetch')
const xml = require('xml')

router.get('/', (req, res) => {

    const limit = req.query['limit']
    let sql = ""

    if (req.get('x-nintendo-parampack')) {

        var decoded_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        if (limit) {
            sql = `SELECT * FROM community WHERE hidden=0 AND related_community=${decoded_pack.title_id} LIMIT ${limit}`
        } else {
            sql = `SELECT * FROM community WHERE hidden=0 AND related_community=${decoded_pack.title_id}`
        }
    } else {
        if (limit) {
            sql = `SELECT * FROM community WHERE hidden=0 LIMIT ${limit}`
        } else {
            sql = `SELECT * FROM community WHERE hidden=0`
        }
    }

    con.query(sql, (err, result, fields) => {
        if (err) { throw err }

        var xml = xmlbuilder.create('communities')
        if (!req.query['json']) {
            result.forEach(element => {
                xml.ele('community')
                    .ele('olive_community_id', element.olive_community_id).up()
                    .ele('community_id', element.community_id).up()
                    .ele('name', element.name).up()
                    .ele('description', element.description).up()
                    .ele('icon', element.icon).up()
                    .ele('icon_3ds', element.icon_3ds).up()
                    .ele('pid', element.pid).up()
                    .ele('app_data', element.app_data).up()
                    .ele('is_user_community', element.is_user_community).end({ allowEmpty: true, pretty: true })
            });

            console.log(result)

            console.log(logger.Get(req.originalUrl))

            res.set('Content-Type', 'application/xml')
            res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>communities</request_name>${xml}</result>`)
        } else {
            res.send(result)
        }
    })
})

router.get('/:community_id', (req, res) => {
    const limit = req.query['limit']
    const community_id = req.params.community_id

    let sql = "SELECT * FROM community WHERE `community_id`=" + community_id

    con.query(sql, (err, result, fields) => {
        if (err) { console.log(logger.Error(err)); res.sendStatus(500); return; }

        if (!req.query['json'] == 1) {
            const xmlResult = `<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>communities</request_name><communities>` + json2xml.json2xml(result, { compact: true, fullTagEmptyElement: true }).replace(/[0-9]+>/g, "community>") + '</communities></result>'//.replace(/[0-9]>+/g, "community>")

            console.log(logger.Get(req.originalUrl))

            res.set('Content-Type', 'text/xml')

            res.send(xmlResult)

        } else {
            res.set('Content-Type', 'application/json')
            res.send(result)
        }
    })
})

router.get('/:community_id/posts', (req, res) => {

    let paremPack = req.get('x-nintendo-parampack')

    //setting querys
    const limit = (req.query['limit']) ? ` LIMIT ${req.query['limit']}` : ''
    const search_key = (req.query['search_key']) ? ` AND search_key LIKE "%${req.query['search_key']}%" ` : ''
    const with_mii = (req.query['with_mii']) ? ` AND mii IS NOT NULL ` : ''

    console.log(logger.Get(req.originalUrl))

    if (req.get('x-nintendo-parampack')) {
        console.log(logger.Info('Found ParemPack!'))
        paremPack = headerDecoder.decodeParamPack(paremPack)

        con.query(`SELECT * FROM community WHERE title_ids LIKE "%${paremPack.title_id}%"`, (err, result, fields) => {
            if (err) { throw err }

            var community_id;
            if (result[0].community_id) {
                community_id = result[0].community_id
            } else {
                community_id = 0
            }
            
            var sql = `SELECT * FROM post WHERE community_id=${community_id}${search_key}${with_mii} ORDER BY id DESC ${limit}`

            con.query(sql, (err, result, fields) => {
                if (err) { throw err }
                var xml = xmlbuilder.create('posts')
                result.forEach(element => {
                    if (!element.painting) {
                        xml.ele('post')
                        .ele('body', element.body).up()
                        .ele('community_id', element.community_id).up()
                        .ele('country_id', element.country_id).up()
                        .ele('created_at', element.created_at).up()
                        .ele('feeling_id', element.feeling_id).up()
                        .ele('id', element.id).up()
                        .ele('is_autopost', element.is_autopost).up()
                        .ele('is_community_private_autopost', element.is_community_private_autopost).up()
                        .ele('is_spoiler', element.is_spoiler).up()
                        .ele('is_app_jumpable', element.is_app_jumpable).up()
                        .ele('empathy_count', element.empathy_count).up()
                        .ele('language_id', element.language_id).up()
                        .ele('mii', element.mii).up()
                        .ele('mii_face_url', element.mii_face_url).up()
                        .ele('number', element.number).up()   
                        .ele('pid', element.pid).up()
                        .ele('platform_id', element.platform_id).up()
                        .ele('region_id', element.region_id).up()
                        .ele('reply_count', element.reply_count).up()
                        .ele('screen_name', element.screen_name).up()
                        .ele('title_id', element.title_id).up()
                        .ele('app_data', String(element.app_data)).up()
                        .ele('topic_tag').ele('name', element.topic_tag).up().ele('title_id', element.title_id).up().up();
                    } else {
                        xml.ele('post')
                        .ele('body', element.body).up()
                        .ele('community_id', element.community_id).up()
                        .ele('country_id', element.country_id).up()
                        .ele('created_at', element.created_at).up()
                        .ele('feeling_id', element.feeling_id).up()
                        .ele('id', element.id).up()
                        .ele('is_autopost', element.is_autopost).up()
                        .ele('is_community_private_autopost', element.is_community_private_autopost).up()
                        .ele('is_spoiler', element.is_spoiler).up()
                        .ele('is_app_jumpable', element.is_app_jumpable).up()
                        .ele('empathy_count', element.empathy_count).up()
                        .ele('language_id', element.language_id).up()
                        .ele('mii', element.mii).up()
                        .ele('mii_face_url', element.mii_face_url).up()
                        .ele('number', element.number).up()
                        .ele('painting')
                            .ele('format', 'tga').up()
                            .ele('content', element.painting).up()
                            .ele('size', element.painting.length).up()
                            .ele('url', "https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1").up().up() 
                        .ele('pid', element.pid).up()
                        .ele('platform_id', element.platform_id).up()
                        .ele('region_id', element.region_id).up()
                        .ele('reply_count', element.reply_count).up()
                        .ele('screen_name', element.screen_name).up()
                        .ele('title_id', element.title_id).up()
                        .ele('app_data', String(element.app_data)).up()
                        .ele('topic_tag').ele('name', element.topic_tag).up().ele('title_id', element.title_id).up().up()
                    }  
                    
                    
                });

                res.set('Content-Type', 'application/xml')
                res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>specified_posts</request_name><topic><community_id>${community_id}</community_id></topic>${xml}</result>`)
            })
        })
    }
    else {
        var community_id = req.params.community_id

        const sql = `SELECT * FROM post WHERE community_id=${community_id} ${search_key}${with_mii}ORDER BY id DESC${limit}`

        con.query(sql, (err, result, fields) => {
            if (err) { throw err }
            
            if (!req.query['json'] == 1) {
                var xml = xmlbuilder.create('posts')
                result.forEach(element => {
                    if (!element.painting) {
                        xml.ele('post')
                        .ele('body', element.body).up()
                        .ele('community_id', element.community_id).up()
                        .ele('country_id', element.country_id).up()
                        .ele('created_at', element.created_at).up()
                        .ele('feeling_id', element.feeling_id).up()
                        .ele('id', element.id).up()
                        .ele('is_autopost', element.is_autopost).up()
                        .ele('is_community_private_autopost', element.is_community_private_autopost).up()
                        .ele('is_spoiler', element.is_spoiler).up()
                        .ele('is_app_jumpable', element.is_app_jumpable).up()
                        .ele('empathy_count', element.empathy_count).up()
                        .ele('language_id', element.language_id).up()
                        .ele('mii', element.mii).up()
                        .ele('mii_face_url', element.mii_face_url).up()
                        .ele('number', element.number).up()   
                        .ele('pid', element.pid).up()
                        .ele('platform_id', element.platform_id).up()
                        .ele('region_id', element.region_id).up()
                        .ele('reply_count', element.reply_count).up()
                        .ele('screen_name', element.screen_name).up()
                        .ele('title_id', element.title_id).up()
                        .ele('app_data', String(element.app_data)).up()
                        .ele('topic_tag').ele('name', element.topic_tag).up().ele('title_id', element.title_id);
                    } else {
                        xml.element('post')
                        .ele('body', element.body).up()
                        .ele('community_id', element.community_id).up()
                        .ele('country_id', element.country_id).up()
                        .ele('created_at', element.created_at).up()
                        .ele('feeling_id', element.feeling_id).up()
                        .ele('id', element.id).up()
                        .ele('is_autopost', element.is_autopost).up()
                        .ele('is_community_private_autopost', element.is_community_private_autopost).up()
                        .ele('is_spoiler', element.is_spoiler).up()
                        .ele('is_app_jumpable', element.is_app_jumpable).up()
                        .ele('empathy_count', element.empathy_count).up()
                        .ele('language_id', element.language_id).up()
                        .ele('mii', element.mii).up()
                        .ele('mii_face_url', element.mii_face_url).up()
                        .ele('number', element.number).up()
                        .ele('painting')
                            .ele('format', 'tga').up()
                            .ele('content', element.painting).up()
                            .ele('size', element.painting.length).up()
                            .ele('url', "https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1").up().up() 
                        .ele('pid', element.pid).up()
                        .ele('platform_id', element.platform_id).up()
                        .ele('region_id', element.region_id).up()
                        .ele('reply_count', element.reply_count).up()
                        .ele('screen_name', element.screen_name).up()
                        .ele('title_id', element.title_id).up()
                        .ele('app_data', String(element.app_data)).up()
                        .ele('topic_tag').ele('name', element.topic_tag).up().ele('title_id', element.title_id)
                    }

                    
                });
    
                res.set('Content-Type', 'application/xml')
                res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>specified_posts</request_name><topic><community_id>${community_id}</community_id></topic>${xml}</result>`)
    
            } else {
                res.set('Content-Type', 'application/json')
                res.send(result)
            }
            
        })
    }
})

router.post('/post', (req, res) => {
    const body = req.get('body')
    const community_id = req.get('communityId')

    console.log(logger.Post("New Post Request!"))

    const sql = `INSERT INTO post (body, community_id, mii_face_url) VALUES ("${body}", ${community_id}, 'https://s3.us-east-1.amazonaws.com/mii-images.account.nintendo.net/3o7et7rykh4fh_happy_face.png?lm=201601282354120000');`

    con.query(sql, (err, result, fields) => {
        if (err) { console.log(logger.Error(err)); res.sendStatus(403); } else {
            console.log(logger.Info('Post Created!'))

            res.sendStatus(200)
        }
    })
})

module.exports = router