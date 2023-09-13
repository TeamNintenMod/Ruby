const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')

const { community_posts } = require('../../../config.json')

const moment = require('moment')
const xmlbuilder = require('xmlbuilder')
const headerDecoder = require('../../../other/decoder')
const multer = require('multer')

const fs = require('fs')

const fetch = require('node-fetch')
const xml = require('xml')
const auth = require('../../../other/auth')

router.post('/', multer().none(), async (req, res) => {
    const name = req.body.name
    const icon = req.body.icon
    const app_data = req.body.app_data
    const description = req.body.description

    const param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
    const service_token = req.get('x-nintendo-servicetoken')

    const account = JSON.parse( await auth.authenticateUser(service_token.slice(0, 42)))

    if (account) {
        const sql1 = `SELECT * FROM community WHERE title_ids LIKE "%${param_pack.title_id}%"`
        con.query(sql1, (err, result1, fields) => {
            if (err) { console.log(logger.Error(err)); res.sendStatus(503) } else {
    
                const sql2 = `INSERT INTO community ( is_user_community, olive_community_id, community_id, name, description, app_data, icon, hidden, wii_vc, title_ids, pid) VALUES(1, ${Number(result1[result1.length-1].community_id) + 5}, ${Number(result1[result1.length-1].community_id) + 5}, "${name + " Tournament"}", "${description}", "${app_data.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()}", "${icon.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()}", 0, 0, "${result1[result1.length-1].title_ids}", ${account[0].pid})`
    
                con.query(sql2, (err, result, fields) => {
                    if (err) { console.log(logger.Error(err)); res.sendStatus(503) } else {
                        console.log(logger.MySQL('Created New User Community'))

                        const banner = fs.readFileSync(__dirname + '/files/bannerTemplate.jpg')
                        fs.writeFileSync(`static/img/banners/${Number(result1[result1.length-1].community_id) + 5}.jpg`, banner)
    
                        fs.writeFile(`static/img/icons/${Number(result1[result1.length-1].community_id) + 5}.jpg`, headerDecoder.paintingProccess(icon), 'base64', function(err) {
                            console.log(err)

                            var xml = xmlbuilder.create('result')
                            .e('has_error', "0").up()
                            .e('version', '1').up()
                            .e('request_name', 'communities').up()
                                .e('community')
                                    .e('community_id', Number(result1[result1.length-1].community_id) + 5).up()
                                    .e('name', name).up()
                                    .e('description', description).up()
                                    .e('icon', icon.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()).up()
                                    .e('icon_3ds', "").up()
                                    .e('pid', account[0].pid).up()
                                    .e('app_data', app_data.replace(/\0/g, "").replace(/\r?\n|\r/g, "").trim()).up()
                                    .e('is_user_community', "1").up().up().end({allowEmpty : true, pretty : true})
                                    
                            res.set('Content-Type', 'application/xml')
                            res.send(xml)
                        })
                    }
                })
            }
        })
    } else {
        res.sendStatus(403)
    }
})


router.get('/new', (req, res) => {
    
})

router.get('/', (req, res) => {

    const limit = (req.query['limit']) ? ` LIMIT ${req.query['limit']}` : ''
    let sql = ""

    if (req.get('x-nintendo-parampack')) {
        const parampack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
        sql = `SELECT * FROM community WHERE hidden=0 AND title_ids LIKE "%${parampack.title_id}%"`
    } else {
        sql = `SELECT * FROM community WHERE hidden=0`
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
                    .ele('icon', element.icon).up()
                    .ele('icon_3ds', element.icon_3ds).up()
                    .ele('pid', element.pid).up()
                    .ele("app_data", element.app_data).up()
                    .ele('is_user_community', element.is_user_community)
            });

            xml.end({pretty : true, allowEmpty : true})
            console.log(logger.Get(req.originalUrl))

            console.log(req.headers)

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

            var sql = `SELECT * FROM post WHERE community_id=${community_id} ${search_key}${with_mii} ORDER BY id DESC ${limit}`

            con.query(sql, (err, result, fields) => {
                if (err) { throw err }

                let xml = xmlbuilder.create('result')
                    .e('has_error', "0").up()
                    .e('version', "1").up()
                    .e('request_name', 'posts').up()
                    .e('topic').e('community_id', community_id).up().up()
                    .e('posts');
                for (let i = 0; i < result.length; i++) {
                    xml = xml.e("post")
                        .e("app_data", result[i].app_data).up()
                        .e("body", result[i].body).up()
                        .e("community_id", result[i].community_id).up()
                        .e('mii', result[i].mii).up()
                        .e('mii_face_url', result[i].mii_face_url).up()
                        .e("country_id", result[i].country_id).up()
                        .e("created_at", result[i].created_at).up()
                        .e("feeling_id", result[i].feeling_id).up()
                        .e("id", result[i].id).up()
                        .e("is_autopost", result[i].is_autopost).up()
                        .e("is_community_private_autopost", "0").up()
                        .e("is_spoiler", result[i].is_spoiler).up()
                        .e("is_app_jumpable", result[i].is_app_jumpable).up()
                        .e("empathy_count", result[i].empathy_count).up()
                        .e("language_id", result[i].language_id).up()
                        .e("number", result[i].number).up();
                    if (result[i].painting) {
                        xml = xml.e("painting")
                            .e("format", "tga").up()
                            .e("content", result[i].painting).up()
                            .e("size", result[i].painting.length).up()
                            .e("url", "https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1").up()
                            .up();
                    }
                    if (result[i].topic_tag) {
                        xml = xml.e('topic_tag').e('name', result[i].topic_tag).up().e('title_id', result[i].title_id).up().up()
                    }
                    xml = xml.e("pid", result[i].pid).up()
                        .e("platform_id", result[i].platform_id).up()
                        .e("region_id", result[i].region_id).up()
                        .e("reply_count", result[i].reply_count).up()
                        .e("screen_name", result[i].screen_name).up()
                        .e("title_id", result[0].title_id).up().up()
                    
                }

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
                let xml = xmlbuilder.create('result')
                    .e('has_error', "0").up()
                    .e('version', "1").up()
                    .e('request_name', 'posts').up()
                    .e('topic').e('community_id', community_id).up().up()
                    .e('posts');
                for (let i = 0; i < result.length; i++) {
                    xml = xml.e("post")
                    .e("app_data", result[i].app_data).up()
                    .e("body", result[i].body).up()
                    .e("community_id", result[i].community_id).up()
                    .e('mii', result[i].mii).up()
                    .e('mii_face_url', result[i].mii_face_url).up()
                    .e("country_id", result[i].country_id).up()
                    .e("created_at", result[i].created_at).up()
                    .e("feeling_id", result[i].feeling_id).up()
                    .e("id", result[i].id).up()
                    .e("is_autopost", result[i].is_autopost).up()
                    .e("is_community_private_autopost", "0").up()
                    .e("is_spoiler", result[i].is_spoiler).up()
                    .e("is_app_jumpable", result[i].is_app_jumpable).up()
                    .e("empathy_count", result[i].empathy_count).up()
                    .e("language_id", result[i].language_id).up()
                    .e("number", result[i].number).up();
                    if (result[i].painting) {
                        xml = xml.e("painting")
                            .e("format", "tga").up()
                            .e("content", result[i].painting).up()
                            .e("size", result[i].painting.length).up()
                            .e("url", "https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1").up()
                            .up();
                    }
                    if (result[i].topic_tag) {
                        xml = xml.e('topic_tag').e('name', result[i].topic_tag).up().e('title_id', result[i].title_id).up().up()
                    }
                    xml = xml.e("pid", result[i].pid).up()
                    .e("platform_id", result[i].platform_id).up()
                    .e("region_id", result[i].region_id).up()
                    .e("reply_count", result[i].reply_count).up()
                    .e("screen_name", result[i].screen_name).up()
                    .e("title_id", result[0].title_id).up().up()
                    
                }

                res.set('Content-Type', 'application/xml')
                res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>specified_posts</request_name><topic><community_id>${community_id}</community_id></topic>${xml}</result>`)
            } else {
                res.set('Content-Type', 'application/json')
                res.send(result)
            }
        })
    }
})

module.exports = router