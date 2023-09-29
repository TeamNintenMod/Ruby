const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../../other/decoder')

const en = require('../../languages/en.json')
const logger = require('../../other/logger')

const moment = require('moment')

const config = require('../../config.json')

const UIQuery = require('../../other/UIQuery')

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

    var account = req.account
    var language = req.language

    var user = JSON.parse(await UIQuery.getUserProfile(account[0].pid))[0]
    var user_posts = JSON.parse(await UIQuery.getAllPostsFromUser(account[0].pid))
    var yeahs_recieved = JSON.parse(await UIQuery.getAllEmpathiesToUser(account[0].pid))

    res.render('portal/user.ejs', {
        account : account,
        language : language,
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

    var account = req.account
    var language = req.language
    
    var user = JSON.parse(await UIQuery.getUserProfile(user_id))[0]
    var user_posts = JSON.parse(await UIQuery.getAllPostsFromUser(user_id))
    var yeahs_recieved = JSON.parse(await UIQuery.getAllEmpathiesToUser(user.pid))

    res.render('portal/user.ejs', {
        account : account,
        language : language,
        user : user,
        posts : user_posts,
        yeahs : yeahs_recieved,
        moment, moment
    })
})

module.exports = router