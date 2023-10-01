const express = require('express')
const router = express.Router()

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')
const config = require('../../../config.json')

const moment = require('moment')

const { placeholderBio } = config

const fetch = require('node-fetch')
const xmlbuilder = require('xmlbuilder')

const util = require('util')

const query = util.promisify(con.query).bind(con)

router.post('/', (req, res) => {
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

                con.query(`INSERT INTO account (nnid, serviceToken, name, bio, admin, pid, mii, hash, banned) VALUES("${responseObject.user_id}", "${serviceToken}", "${responseObject.name}", "${config.placeholderBio}", 0, ${responseObject.pid}, "${responseObject.data}", "${responseObject.images.hash}", 0);`, function (err, result, fields) {
                    if (err) {console.log(logger.Error(err)); res.sendStatus(503); return;} else {
                        console.log(logger.MySQL('Account Created!'))
                        res.sendStatus(201)
                    }   
                })

            })
        }
    })
})

router.get('/', async (req, res) => {

    if (req.query['pid']) {
        xml = xmlbuilder.create('result')
        .e('has_error', '0').up()
        .e('version', '1').up()
        .e('request_name', 'people').up()
        .e('people');
        
        for (let i = 0; i < req.query['pid'].length; i++) {

            const pid = req.query['pid'][i]

            const person = (await query(`SELECT * FROM post WHERE pid=? ORDER BY created_at DESC LIMIT 1`, [pid]))[0]
            if (person) {
                xml = xml.e('person')
                .e('posts')
                .e('post')
                .e('app_data', person.app_data).up()
                .e('body', person.body).up()
                .e('community_id', person.community_id).up()
                .e('country_id', person.country_id).up()
                .e('created_at', person.created_at).up()
                .e('feeling_id', person.feeling_id).up()
                .e('id', person.id).up()
                .e('is_autopost', person.is_autopost).up()
                .e('is_community_private_autopost', '0').up()
                .e('is_spoiler', person.is_spoiler).up()
                .e('is_app_jumpable', person.is_app_jumpable).up()
                .e('empathy_count', (await query(`SELECT * FROM empathies WHERE post_id=?`, [person.id])).length).up()
                .e('language_id', person.language_id).up()
                .e('mii', person.mii).up()
                .e('mii_face_url', person.mii_face_url).up()
                .e('number', '0').up();
                if (person.painting) {
                    xml = xml.e('painting')
                    .e('format', 'tga').up()
                    .e('content', person.painting).up()
                    .e('size', person.painting.length).up()
                    .e('url', 'https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1').up().up()
                }
                xml = xml.e('pid', person.pid).up()
                .e('platform_id', person.platform_id).up()
                .e('region_id', person.region_id).up()
                //TODO: change reply count to grab from database, once replies are created.
                .e('reply_count', '0').up()
                .e('screen_name', person.screen_name).up()
                const title_ids = JSON.parse((await query(`SELECT * FROM community WHERE community_id=${person.community_id}`))[0].title_ids)

                for (let i = 0; i < title_ids.length; i++) {
                    xml = xml.e('title_id', title_ids[i]).up()
                }

                xml = xml.up().up().up()
            }
        }

        xml = xml.end({pretty : true, allowEmpty : true})

        res.set('Content-Type', 'application/xml')
        res.send(xml)
    } else {
        res.sendStatus(404)
    }
})



module.exports = router