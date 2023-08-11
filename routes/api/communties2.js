const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../mysqlConnection')

const moment = require('moment')
const xml = require('xml')

router.get('/', (req, res) => {

    const sql = "SELECT * FROM community"

    con.query(sql, (err, result, fields) => {
        if (err) { throw err }

        const xmlResult = json2xml.json2xml(result, {compact : true, fullTagEmptyElement : true}).replace(/[0-9]>/g, "community>")

        console.log(`[GET] ${req.originalUrl}`.green)

        res.set('Content-Type', 'text/xml')

        res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>communities</request_name><communities>${xmlResult}</communities></result>`)

    })
})

router.get('/:community_id/posts', (req, res) => {

    const community_id = req.params.community_id

    const sql = `SELECT * FROM post WHERE 'community_id'=${community_id}`

    con.query(sql, (err, result, fields) => {
        if (err) { throw err }

        const xmlResult = json2xml.json2xml(result, {compact : true, fullTagEmptyElement : true}).replace(/[0-9]>/g, "post>")

        console.log(`[GET] ${req.originalUrl}`.green)

        res.set('Content-Type', 'text/xml')

        res.send(`<?xml version="1.0" encoding="UTF-8"?><result><has_error>0</has_error><version>1</version><request_name>specified_posts</request_name><topic><community_id>${community_id}</community_id></topic><posts>${xmlResult}</posts></result>`)
    })
})

module.exports = router