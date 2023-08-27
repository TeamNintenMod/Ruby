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

    if (limit) {
        sql = `SELECT * FROM community WHERE hidden=0 LIMIT ${limit}`
    } else {
        sql = `SELECT * FROM community WHERE hidden=0`
    }

    con.query(sql, (err, result, fields) => {
        if (err) { throw err }

        var xml = xmlbuilder.create('communities')
        if (!req.query['json']) {

            xml.ele('community').up()

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
                .ele('is_user_community', element.is_user_community).up()
            });

            console.log(result)

            console.log(logger.Get(req.originalUrl))

            res.set('Content-Type', 'application/xml')
            res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>communities</request_name>${xml}</result>`)
        }  else {
            res.send(result)
        }
    })
})

router.post('/', multer().none(), (req, res) => {
    const icon = req.body.icon
    const name = req.body.name
    const app_data = req.body.app_data
    const description = req.body.description

    const service_token = req.get('x-nintendo-servicetoken')
    const param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

    fetch(`https://olvapi.nonamegiven.xyz/v1/people/person?token=${service_token.slice(0, 42)}`).then(response => response.text()).then(response => {
        if (response.replace('[]', "")) {
            const account = JSON.parse(response)

            console.log(logger.MySQL('Creating New User Made Community..'))

            con.query(`INSERT INTO community (name, description, icon, pid, app_data, is_user_community, hidden) VALUES("${name}", "${description}", "${icon.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()}", ${account[0].pid}, "${app_data.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()}", 0, 0)`, (err, result, fields) => {
                if (err) { console.log(logger.Error(err)); res.sendStatus(500)} else {
                    console.log(logger.MySQL('Created New User Made Community!!'))

                    var xml = xmlbuilder.create('result')

                    con.query(`SELECT * FROM community WHERE olive_community_id=${result.insertId}`, (err, result, fields) => {
                        var community = result[0]

                        xml.ele('has_error', 0).up()
                        .ele('version', 1).up()
                        .ele('request_name', "community").up()
                        .ele('community').ele('community_id', community.olive_community_id).up()
                        .ele('name', community.name).up()
                        .ele('description', community.description).up()
                        .ele('icon', community.icon).up()
                        .ele('icon_3ds').up()
                        .ele('pid', community.pid).up()
                        .ele('app_data', community.app_data).up()
                        .ele('is_user_community', 0).end({ pretty : true, allowEmpty : true })
    
                        res.set('Content-Type', "text/xml")
                        res.send('<?xml version="1.0" encoding="UTF-8"?>' + xml)
                    })
                }
            })
        } else {
            res.sendStatus(403)
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
            const xmlResult = `<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>communities</request_name><communities>` + json2xml.json2xml(result, {compact : true, fullTagEmptyElement : true}).replace(/[0-9]+>/g, "community>") + '</communities></result>'//.replace(/[0-9]>+/g, "community>")

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
    const limit = req.query['limit']
    const search_key = req.query['search_key']
    let community_id = req.params.community_id

    let sql

    if (req.get('x-nintendo-parampack')) {
        console.log(logger.Info('Found ParemPack!'))
        paremPack = headerDecoder.decodeParamPack(paremPack)
        community_id = paremPack.title_id

        if (limit) {
            sql = 'SELECT * FROM post WHERE `community_id`=' + community_id + ' AND `search_key` LIKE "%' + search_key + '%" LIMIT ' + limit 
        } else {
            sql = 'SELECT * FROM post WHERE `community_id`=' + community_id + ' AND `search_key` LIKE "%' + search_key + '%"'
        }
    } else {
        console.log(logger.Info('Did not find ParemPack..'))
        community_id = req.params.community_id

        if (limit) {
            sql = 'SELECT * FROM post WHERE `community_id`=' + community_id + ' LIMIT ' + limit 
        } else {
            sql = 'SELECT * FROM post WHERE `community_id`=' + community_id + ' ORDER BY `id` DESC'
        }
    }

    con.query(sql, (err, result, fields) => {
        if (err) { throw err }

        if (!req.query['json'] == 1) {
            var xml = xmlbuilder.create('posts')

            result.forEach(element => {
    
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
                        .ele('topic_tag').ele('name', element.topic_tag).up().ele('title_id', element.title_id).up()
                        
            });        
    
            res.set('Content-Type', 'application/xml')
    
            res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>specified_posts</request_name><topic><community_id>${community_id}</community_id></topic>${xml}</result>`)
        } else {
            res.set('Content-Type', 'application/json')

            res.send(result)
        }

        
    })
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