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

    let serviceToken, paramPack;

    if (req.get('x-nintendo-parampack') && req.get('x-nintendo-servicetoken')) {
        serviceToken = req.get('x-nintendo-servicetoken').slice(0, 42)
        paramPack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        console.log(logger.Info('Found Service Token And/Or ParamPack'))
    } else {
        serviceToken = config.guest_token
        paramPack = 0

        console.log(logger.Error('Did not find any Service Token or ParamPack. Setting both values to "0" as default.'))
    }

    const account = JSON.parse(await auth.authenticateUser(serviceToken).catch(() => {
        res.redirect('https://olvportal.nonamegiven.xyz/titles/newUser')
    }))

    if (account) {
        console.log(logger.Get(req.originalUrl))

        var communities = JSON.parse(await UIQuery.getCommunities('newest'))

        res.render('./pages/index.ejs', {
            account: account,
            communities: communities,
            current_announcement: config.current_announcement
        })
    } else {
        res.redirect('https://olvportal.nonamegiven.xyz/titles/newUser')
    }
})

router.get('/newUser', (req, res) => {
    res.render('./pages/newuser/startup.ejs', {
        language: en
    })
})

router.get('/', (req, res) => {
    console.log(logger.Get(req.originalUrl))
})

router.get('/newUser/1', (req, res) => {
    res.render('./pages/newuser/nnidcreation.ejs', {
        language: en
    })
})

router.get('/:community_id', async (req, res) => {
    const community_id = req.params.community_id
    const parser = new xmlparser.XMLParser();

    let serviceToken = req.get('x-nintendo-servicetoken')
    if (!serviceToken) {
        serviceToken = config.guest_token
        console.log(logger.Error('Found no service token, replacing with default values.'))
    }

    var posts = JSON.parse(await UIQuery.getPosts(community_id))
    var community = JSON.parse(await UIQuery.getCommunityData(community_id))[0]
    var account = JSON.parse(await auth.authenticateUser(serviceToken))

    res.render('pages/community.ejs', {
        posts: posts,
        community: community,
        account: account,
        moment: moment
    })
})

router.get('/post/:title_id', (req, res) => {
    const title_id = req.params.title_id

    res.render('pages/post.ejs', {
        title_id: title_id
    })
})

router.get('/users/:userId', (req, res) => {
    res.render('pages/user.ejs', {

    })
})

module.exports = router