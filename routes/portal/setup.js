const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../../other/decoder')

const en = require('../../languages/en.json')
const logger = require('../../other/logger')

const moment = require('moment')

const config = require('../../config.json')

const UIQuery = require('../../other/UIQuery')

router.get('/02', (req, res) => {
    res.render('portal/setup/new_user_02', {
        language: en
    })
})

router.get('/03', async (req, res) => {
    var account = req.account
    var language = req.language

    res.render('portal/setup/new_user_03', {
        account : account,
        language: language
    })
})

router.get('/04', async (req, res) => {
    var account = req.account
    var language = req.language

    res.render('portal/setup/new_user_04', {
        account : account,
        language: language
    })
})

router.get('/05', async (req, res) => {
    var account = req.account
    var language = req.language

    res.render('portal/setup/new_user_final', {
        account : account,
        language: language
    })
})

module.exports = router