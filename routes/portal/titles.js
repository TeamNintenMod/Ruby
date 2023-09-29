const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../../other/decoder')

const en = require('../../languages/en.json')
const logger = require('../../other/logger')

const moment = require('moment')

const config = require('../../config.json')

const UIQuery = require('../../other/UIQuery')

router.get('/show', async (req, res) => {

    var service_token, param_pack;

    if (req.get('x-nintendo-parampack') && req.get('x-nintendo-servicetoken')) {
        service_token = req.get('x-nintendo-servicetoken').slice(0, 42)
        param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        console.log(logger.Info('Found Service Token And/Or ParamPack'))
    } else {
        service_token = config.guest_token
        param_pack = 0

        console.log(logger.Error('Did not find any Service Token or ParamPack. Setting both values to default.'))
    }

    var account = req.account
    var language = req.language

    console.log(logger.Get(req.originalUrl))

    var communities = JSON.parse(await UIQuery.getCommunities('newest'))

    res.render('portal/index.ejs', {
        account: account,
        language : language,
        communities: communities,
        current_announcement: config.current_announcement
    })
})

router.get('/', (req, res) => {
    console.log(logger.Get(req.originalUrl))
})

router.get('/newUser/1', (req, res) => {
    res.render('portal/setup/new_user_02', {
        language: en
    })
})

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