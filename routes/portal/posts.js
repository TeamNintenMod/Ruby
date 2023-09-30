const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../../other/decoder')

const en = require('../../languages/en.json')
const logger = require('../../other/logger')

const moment = require('moment')

const config = require('../../config.json')

const UIQuery = require('../../other/UIQuery')

router.get('/:post_id', async (req, res) => {

    console.log(logger.Get(req.originalUrl))

    const post_id = req.params.post_id
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
    
    var post = JSON.parse(await UIQuery.getSinglePost(post_id, account[0].pid))[0]
    var empathized_users = JSON.parse(await UIQuery.getAllUserProfileFromPostEmpathies(post_id))

    res.render('portal/post', {
        account : account,
        language : language,
        empathized_users : empathized_users,
        post : post,
        moment : moment
    })
})

module.exports = router