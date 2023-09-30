const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../../other/decoder')

const en = require('../../languages/en.json')
const logger = require('../../other/logger')

const moment = require('moment')

const config = require('../../config.json')

const UIQuery = require('../../other/UIQuery')

router.get('/:community_id', async (req, res) => {
    const community_id = req.params.community_id
    var service_token;

    if (req.get('x-nintendo-parampack') && req.get('x-nintendo-servicetoken')) {
        service_token = req.get('x-nintendo-servicetoken').slice(0, 42)
        param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        console.log(logger.Info('Found Service Token And/Or ParamPack'))
    } else {
        service_token = config.guest_token
        param_pack = 0

        console.log(logger.Error('Did not find any Service Token or ParamPack. Setting both values to default.'))
    }

    var posts = JSON.parse(await UIQuery.getPosts(community_id, 10))
    var community = JSON.parse(await UIQuery.getCommunityData(community_id))[0]
    var account = req.account
    var language = req.language

    res.render('portal/community.ejs', {
        posts: posts,
        community: community,
        account: account,
        language : language,
        moment: moment
    })
})

module.exports = router