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

router.get('/me', async (req, res) => {
    console.log(logger.Get(req.originalUrl))

    var service_token, param_pack

    if (req.get('x-nintendo-parampack') && req.get('x-nintendo-servicetoken')) {
        service_token = req.get('x-nintendo-servicetoken').slice(0, 42)
        param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        console.log(logger.Info('Found Service Token And/Or ParamPack'))
    } else {
        service_token = config.guest_token
        param_pack = 0

        console.log(logger.Error('Did not find any Service Token or ParamPack. Setting both values to default.'))
    }

    var account = (await auth.authenticateUser(service_token))[0]

    var user = JSON.parse(await UIQuery.getUserProfile(account.pid))[0]
    var user_posts = JSON.parse(await UIQuery.getAllPostsFromUser(account.pid))
    var yeahs_recieved = JSON.parse(await UIQuery.getAllEmpathiesToUser(account.pid))

    res.render('portal/user.ejs', {
        account : account,
        user : user,
        posts : user_posts,
        yeahs : yeahs_recieved,
        moment, moment
    })
})

router.get('/show', async (req, res) => {

    console.log(logger.Get(req.originalUrl))

    const user_id = req.query['pid']
    var service_token, param_pack

    if (req.get('x-nintendo-parampack') && req.get('x-nintendo-servicetoken')) {
        service_token = req.get('x-nintendo-servicetoken').slice(0, 42)
        param_pack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        console.log(logger.Info('Found Service Token And/Or ParamPack'))
    } else {
        service_token = config.guest_token
        param_pack = 0

        console.log(logger.Error('Did not find any Service Token or ParamPack. Setting both values to default.'))
    }

    var account = (await auth.authenticateUser(service_token))[0]
    var user = JSON.parse(await UIQuery.getUserProfile(user_id))[0]
    var user_posts = JSON.parse(await UIQuery.getAllPostsFromUser(user_id))
    var yeahs_recieved = JSON.parse(await UIQuery.getAllEmpathiesToUser(user.pid))

    res.render('portal/user.ejs', {
        account : account,
        user : user,
        posts : user_posts,
        yeahs : yeahs_recieved,
        moment, moment
    })
})

module.exports = router