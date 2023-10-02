const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')

const { community_posts } = require('../../../config.json')

const multer = require('multer')

const moment = require('moment')
const xml = require('xml')

const xmlbuilder = require('xmlbuilder')

const fetch = require('node-fetch')
const fs = require('fs')

const pako = require('pako')
const PNG = require('pngjs').PNG
const TGA = require('tga')

const headerDecoder = require('../../../other/decoder')
const { title } = require('process')

const util = require('util')

const query = util.promisify(con.query).bind(con)

const icon = "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"

router.get('/', async (req, res) => {
    const communities = await query(`SELECT * FROM community AS c WHERE hidden=0 AND type="wiiu" 
    ORDER BY 
    (SELECT COUNT(community_id) FROM post WHERE community_id=c.community_id)
    DESC`)

    //ty pretendo for the topics generation code

    let xml = xmlbuilder.create('result')
    .e('has_error', '0').up()
    .e('version', '1').up()
    .e('request_name', 'topics').up()
    .e('expire', moment().add(1, 'day').format('YYYY-MM-DD HH:MM:SS')).up()
    .e('topics');

    for (let i = 0; i < communities.length; i++) {
        const community = communities[i];

        var posts = await query(`SELECT * FROM post WHERE community_id=${community.community_id} GROUP BY pid ORDER BY created_at DESC LIMIT 15`)

        xml = xml.e('topic')
        .e('empathy_count', (await query(`SELECT * FROM favorites WHERE community_id=${community.community_id}`)).length).up()
        .e('has_shop_page', '1').up()
        .e('icon', String(fs.readFileSync(__dirname + `/files/encoded/${community.community_id}.txt`))).up()
        .e('title_ids');
        JSON.parse(community.title_ids).forEach(element => {
            xml = xml.e('title_id', element).up()
        });
        xml = xml.up()
        .e('title_id', JSON.parse(community.title_ids)[0]).up()
        .e('community_id', community.community_id).up()
        .e('is_recommended', community.recommended).up()
        .e('name', community.name).up()
        .e('people');
        for (const post of posts) {
            xml = xml.e('person')
            .e('posts')
            .e("post")
            .e('body', post.body).up()
            .e('community_id', community.community_id).up()
            .e('country_id', post.country_id).up()
            .e('created_at', post.created_at).up()
            .e('feeling_id', post.feeling_id).up()
            .e('id', post.id).up()
            .e('is_autopost', post.is_autopost).up()
            .e('is_community_private_autopost', '0').up()
            .e('is_spoiler', post.is_spoiler).up()
            .e('is_app_jumpable', post.is_app_jumpable).up()
            .e('empathy_count', (await query(`SELECT * FROM empathies WHERE post_id=${post.id}`)).length).up()
            .e('language_id', post.language_id).up()
            .e('mii', post.mii).up()
            .e('mii_face_url', post.mii_face_url).up()
            .e('number', '0').up();
            if (post.painting) {
                xml = xml.e('painting')
                .e('format', 'tga').up()
                .e('content', post.painting).up()
                .e('size', post.painting.length).up()
                .e('url', "https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1").up().up();
            }
            xml = xml.e('pid', post.pid).up()
            .e('platform_id', post.platform_id).up()
            .e('region_id', post.region_id).up()
            .e('reply_count', '0').up()
            .e('screen_name', post.screen_name).up()
            for (let i = 0; i < JSON.parse(community.title_ids).length; i++) {
                const title_id = JSON.parse(community.title_ids)[i];
                
                xml = xml.e('title_id', title_id).up()
            }

            xml = xml.up().up().up()
        }
        xml = xml.up().e('position', i + 1).up().up()
    }
    
    fs.writeFileSync('WWPTest.xml', xml.end({ pretty: true, allowEmpty: true }))

    res.set('Content-Type', 'application/xml')

    res.send(xml.end({pretty : true, allowEmpty : true}))
})

module.exports = router