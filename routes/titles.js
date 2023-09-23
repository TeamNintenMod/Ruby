const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../other/decoder')

const en = require('../languages/en.json')
const logger = require('../other/logger')

const moment = require('moment')

const auth = require('../other/auth')
const config = require('../config.json')

const UIQuery = require('../other/UIQuery')

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

    var account = await auth.authenticateUser(service_token).catch(() => {
        res.render('portal/setup/new_user_01', {
            language: en
        })
        console.log(logger.Info('New User Setup Initiated!'))
    })

    console.log(logger.Get(req.originalUrl))

    var key = (req.query['sort']) ? req.query['sort'] : 'popular' 
    var communities = JSON.parse(await UIQuery.getCommunities(key))

    res.render('portal/index.ejs', {
        account: account,
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
    var account = await auth.authenticateUser(service_token)

    res.render('portal/community.ejs', {
        posts: posts,
        community: community,
        account: account,
        moment: moment
    })
})

module.exports = router