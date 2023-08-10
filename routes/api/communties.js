const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../mysqlConnection')

const moment = require('moment')
const xml = require('xml')

router.get('/', function(req, res) {
    const limit = req.query['limit']
    con.query(`SELECT * FROM community`, function(err, result, fields) {

        let xml = '<result> \n<has_error>0</has_error> <!-- Server API Error --> \n<version>1</version> <!-- Server API Version --> \n<request_name>communities</request_name> <!-- Request Name --> \n <communities> \n'

        result.forEach(element => {
            xml += `<community>
            <olive_community_id>${element.olive_community_id}</olive_community_id> <!-- Olive Commmunity ID -->
            <community_id>${element.community_id}</community_id> <!-- Commmunity ID -->
            <name>${element.name}</name> <!-- Community Name -->
            <description>${element.description}</description> <!-- Community Description -->
            <icon>${element.icon}</icon> <!-- Base64 Encoded TGA 128x128px -->
            <icon_3ds>${element.icon_3ds}</icon_3ds> <!-- Base64 Encoded TGA 48x48px -->
            <pid>${element.pid}</pid> <!-- Community Owner Friend Code -->
            <app_data>${element.app_data}</app_data>
            <is_user_community>${element.is_user_community}</is_user_community> <!-- If User Made Community -->
          </community>`   
        });

        xml += "</communities>\n</result>"

        console.log(xml)

        res.set('Content-Type', 'text/xml')
        res.send('<?xml version="1.0" encoding="UTF-8"?> \n' + xml)
    })
})

router.get('/:communityId/posts/', function(req, res) {
    const limit = req.query['limit']
    const titleId = req.params.communityId

            con.query("SELECT * FROM post AS post", function (err, result, fields) {

            if (err) {throw err}

            let xml = "<result> \n<has_error>0</has_error> \n<version>1</version> \n<request_name>specified_posts</request_name> <!-- Request Name --> \n<topic> \n<community_id>6</community_id> <!-- Community ID --> \n</topic> \n<posts> \n";

            result.forEach(element => {
                xml += `<post>
                    <body> ${element.body} </body> <!-- Post Body -->
                    <community_id>${element.community_id}</community_id> <!-- Community ID -->
                    <country_id>${element.country_id}</country_id> <!-- Users Country ID -->
                    <created_at>${element.created_at}</created_at> <!-- Post Created At -->
                    <feeling_id>${element.feeling_id}</feeling_id> <!-- Users Feeling ID -->
                    <id>${element.id}</id> <!-- Post ID -->
                    <is_autopost>${element.is_autopost}</is_autopost>
                    <is_community_private_autopost>${element.is_community_private_autopost}</is_community_private_autopost>
                    <is_spoiler>${element.is_spoiler}</is_spoiler> <!-- Is Post Spoiler -->
                    <is_app_jumpable>${element.is_app_jumpable}</is_app_jumpable> <!-- Can Title Be Opened in EShop -->
                    <empathy_count>${element.empathy_count}</empathy_count> <!-- Post Yeah Count -->
                    <language_id>${element.language_id}</language_id> <!-- Users Language ID -->
                    <mii>${element.mii}</mii> <!-- Base64 Encoded TGA -->
                    <mii_face_url>${element.mii_face_url}</mii_face_url> <!-- Users Mii Face TGA Url -->
                    <number>${element.number}</number>
                    <painting>
                      <format>tga</format> <!-- Image Format -->
                      <content></content> <!-- Base64 Encoded TGA -->
                      <size>5000</size> <!-- TGA File Size -->
                      <url>http://example.com/image.tga</url> <!-- TGA Url -->
                    </painting>
                    <pid>${element.pid}</pid> <!-- Users Friend Code -->
                    <platform_id>${element.platform_id}</platform_id> <!-- Users Console/Platform ID -->
                    <region_id>${element.region_id}</region_id> <!-- Users Region ID -->
                    <reply_count>${element.reply_count}</reply_count> <!-- Post Reply Count -->
                    <screen_name>${element.screen_name}</screen_name> <!-- Users Screen Name -->
                    <title_id>${element.title_id}</title_id> <!-- Game Title ID -->
                </post> 
                `
            });

            xml += " </posts> \n </result>"

            console.log('<?xml version="1.0" encoding="UTF-8"?> \n' + xml)

            res.set('Content-Type', 'text/xml')

            res.send('<?xml version="1.0" encoding="UTF-8"?> \n' + xml)
        })
})

router.post('/:titleid/posts', function(req, res) {
    const nnid = req.get('nnid')
    const password = req.get('password')
    const token = req.get('token')
    const content = req.get('content')

    console.log(nnid, password, token, content)

    con.query(`SELECT * FROM account WHERE token='${token}'`, function(err, result, fields) {
        if (err) throw {err}
        console.log(result)

        try {
            const miiUrl = `http://mii-images.account.nintendo.net/${result[0].miiHash}_normal_face.png`

            const date = moment().format("YYYY-MM-DD HH:mm:ss")

            con.query(`INSERT INTO post (create_time, content, userId, nnid, miiUrl) VALUES ("${date}", "${content}", "${result[0].id}", "${result[0].nnid}", "${miiUrl}")`, function(err, result, fields) {
                if (err) throw {err}
        
                console.log("[MYSQL] Created new post!".blue)
                res.sendStatus(200)
            })
        } catch (error) {
            console.log(error)
            res.sendStatus(403)
        }
    })
})

module.exports = router