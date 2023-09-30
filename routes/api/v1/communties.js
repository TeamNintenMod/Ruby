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
const { XMLBuilder } = require('fast-xml-parser')

const ejs = require('ejs')

const util = require('util')

const query = util.promisify(con.query).bind(con)

router.post('/', multer().none(), async (req, res) => {
    const name = req.body.name
    const icon = req.body.icon
    const app_data = req.body.app_data
    const description = req.body.description

    const param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
    const service_token = req.get('x-nintendo-servicetoken')

    const account = req.account
})

router.get('/', async (req, res) => {

    const limit = (req.query['limit']) ? ` LIMIT ${req.query['limit']}` : ''
    let sql = ""

    const order = (req.query['new']) ? 'ORDER BY created_at DESC ' : ''

    if (req.get('x-nintendo-parampack')) {
        const parampack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))
        sql = `SELECT * FROM community WHERE hidden=0 AND title_ids LIKE "%${parampack.title_id}%"`
    } else {
        sql = `SELECT * FROM community WHERE hidden=0 ${order}`
    }

    const communities = await query(sql)

    var xml = xmlbuilder.create('communities')

    communities.forEach(element => {
        xml.ele('community')
            .ele('olive_community_id', element.olive_community_id).up()
            .ele('community_id', element.community_id).up()
            .ele('description', element.description).up()
            .ele('name', element.name).up()
            .ele('icon', element.icon).up()
            .ele('icon_3ds', element.icon_3ds).up()
            .ele('pid', element.pid).up()
            .ele("app_data", element.app_data).up()
            .ele('is_user_community', element.is_user_community)
    });

    xml.end({ pretty: true, allowEmpty: true })

    res.set('Content-Type', 'application/xml')

    //TODO: make xml gen do all of this so i don't have to add all of t
    res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>communities</request_name>${xml}</result>`)
})

router.get('/:community_id', async (req, res) => {
    const limit = req.query['limit']
    const community_id = req.params.community_id

    var sql = `SELECT * FROM community WHERE community_id=${community_id}`

    const community = (await query(sql))[0]

    var xml = new xmlbuilder.create('result')
        .e('has_error', '0').up()
        .e('version', '1').up()
        .e('request_name', 'community').up()
        .e('communites')
        .e('community')
        .e('olive_community_id', community.olive_community_id).up()
        .e('community_id', community.community_id).up()
        .e('description', community.description).up()
        .e('name', community.name).up()
        .e('icon', community.icon).up()
        .e('icon_3ds', community.icon_3ds).up()
        .e('pid', community.pid).up()
        .e("app_data", community.app_data).up()
        .e('is_user_community', community.is_user_community).up().up()

    res.set('Content-Type', 'application/xml')
    res.send(xml.end({ pretty: true, allowEmpty: true }))

})

router.get('/:community_id/posts', async (req, res) => {
    var param_pack;

    //setting querys
    const limit = (req.query['limit']) ? ` LIMIT ${req.query['limit']}` : ''
    const search_key = (req.query['search_key']) ? ` AND search_key LIKE "%${req.query['search_key']}%" ` : ''
    const with_mii = (req.query['with_mii']) ? ` AND mii IS NOT NULL ` : ''
    const distinct_pid = (req.query['distinct_pid']) ? ` GROUP BY pid ` : ''

    var community, community_id;

    if (req.get('x-nintendo-parampack')) {
        param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        community = await query(`SELECT * FROM community WHERE title_ids LIKE "%${param_pack.title_id}%"`)

        if (community[0]) {
            community_id = community[0].community_id
        } else {
            console.log(logger.Error(`Couldn't find posts for ${param_pack.title_id}`))
            res.sendStatus(404)
            return;
        }
    } else {
        community_id = req.params.community_id
    }

    var sql = `SELECT * FROM post WHERE community_id=${community_id} ${search_key}${with_mii}${distinct_pid} ORDER BY id DESC ${limit}`

    const posts = await query(sql)

    let xml = xmlbuilder.create('result')
        .e('has_error', "0").up()
        .e('version', "1").up()
        .e('request_name', 'posts').up()
        .e('topic').e('community_id', community_id).up().up()
        .e('posts');
    for (let i = 0; i < posts.length; i++) {
        xml = xml.e("post")
            .e("app_data", posts[i].app_data).up()
            .e("body", posts[i].body).up()
            .e("community_id", posts[i].community_id).up()
            .e('mii', posts[i].mii).up()
            .e('mii_face_url', posts[i].mii_face_url).up()
            .e("country_id", posts[i].country_id).up()
            .e("created_at", posts[i].created_at).up()
            .e("feeling_id", posts[i].feeling_id).up()
            .e("id", posts[i].id).up()
            .e("is_autopost", posts[i].is_autopost).up()
            .e("is_community_private_autopost", "0").up()
            .e("is_spoiler", posts[i].is_spoiler).up()
            .e("is_app_jumpable", posts[i].is_app_jumpable).up()
            .e("empathy_count", posts[i].empathy_count).up()
            .e("language_id", posts[i].language_id).up()
            .e("number", posts[i].number).up();
        if (posts[i].painting) {
            xml = xml.e("painting")
                .e("format", "tga").up()
                .e("content", posts[i].painting).up()
                .e("size", posts[i].painting.length).up()
                .e("url", "https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1").up()
                .up();
        }
        if (posts[i].topic_tag) {
            xml = xml.e('topic_tag')
                .e('name', posts[i].topic_tag).up()
                .e('title_id', posts[i].title_id).up().up()
        }
        xml = xml.e("pid", posts[i].pid).up()
            .e("platform_id", posts[i].platform_id).up()
            .e("region_id", posts[i].region_id).up()
            .e("reply_count", posts[i].reply_count).up()
            .e("screen_name", posts[i].screen_name).up()
            .e("title_id", posts[i].title_id).up().up()
    }

    xml = xml.end({ pretty: true, allowEmpty: true })

    res.set('Content-Type', 'application/xml')
    res.send(`${xml}`)
})

router.post('/:community_id/favorite', async (req, res) => {
    var community_id = req.params.community_id

    console.log(logger.Info(req.originalUrl))

    const account = req.account

    if (account[0]) {
        var favorited_communities = JSON.parse(account[0].favorited_communities)

        if (!favorited_communities.includes(Number(community_id))) {
            favorited_communities.push(Number(community_id))

            await query(`UPDATE account SET favorited_communities="${JSON.stringify(favorited_communities)}" WHERE id=${account[0].id}`)
            res.sendStatus(201)
        } else {
            favorited_communities.splice(favorited_communities.indexOf(Number(community_id)), 1)

            await query(`UPDATE account SET favorited_communities="${JSON.stringify(favorited_communities)}" WHERE id=${account[0].id}`)
            res.sendStatus(200)
        }
    } else {
        res.sendStatus(401)
    }
})

router.get('/:community_id/loadmoreposts', async (req, res) => {
    const community_id = req.params.community_id
    const offset = (req.query['offset']) ? req.query['offset'] : 10

    var sql = `SELECT * FROM post WHERE community_id=${community_id} ORDER BY id DESC LIMIT ${offset}, 99999`

    const posts_db = await query(sql)

    var posts = ""

    for (let i = 0; i < posts_db.length; i++) {
        const element = posts_db[i];

        var post_html = await ejs.renderFile('views/portal/partials/post.ejs', {
            post: element,
            moment: moment,
            href_needed: true
        }, { rmWhitespace: true })

        posts += ('<li>' + post_html + '</li>')
    }

    res.send(posts)
})

module.exports = router