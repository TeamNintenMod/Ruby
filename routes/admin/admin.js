const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../../other/decoder')

const body_parser = require('body-parser')

const en = require('../../languages/en.json')
const logger = require('../../other/logger')

const moment = require('moment')

const config = require('../../config.json')

const UIQuery = require('../../other/UIQuery')

const con = require('../../other/mysqlConnection')

const util = require('util')

const query = util.promisify(con.query).bind(con)

const fs = require('fs')
const path = require('path')

router.use(body_parser.urlencoded({extended : false, limit : '150mb'}))
router.use(body_parser.json({limit : '150mb'}))

router.get('/', async (req, res) => {

    var communities = JSON.parse(await UIQuery.getCommunities('newest', 99999, 1))
    var account = req.account[0]

    res.render('admin/admin.ejs', {
        communities : communities,
        account : account
    })
})

router.get('/audit', async (req, res) => {
    var actions = JSON.parse(await UIQuery.getAllAdminActions())

    res.render('admin/admin_audit.ejs', {
        account : req.account[0],
        actions : actions
    })
})

router.get('/communities/new', (req, res) => {
    res.render('admin/admin_create_community', {
        account : req.account[0]
    })

    console.log(parseInt("000500001014D900", 16))
})

router.post('/communities/new', async (req, res) => {

    fs.writeFileSync(`static/img/icons/${req.body.id}.jpg`, req.body.icon, 'base64')
    fs.writeFileSync(`static/img/banners/${req.body.id}.jpg`, req.body.banner, 'base64')

    await query(`INSERT INTO community (community_id, olive_community_id, name, description, app_data, title_ids, recommended, created_at, type, hidden, app_jumpable) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, 1)`, [req.body.id, req.body.id, req.body.name, req.body.description, req.body.app_data, req.body.title_ids, req.body.recommended, req.body.type, 0])
    await query(`INSERT INTO admin_actions (create_time, admin, action) VALUES(NOW(), ?, ?)`, [req.account[0].nnid, `Created community : ${req.body.name}`])

    res.sendStatus(201)
})


router.get('/communities/:id', async(req, res) => {
    var community = JSON.parse(await UIQuery.getCommunityData(req.params.id))[0]
    
    res.render('admin/admin_edit_community', {
        community : community,
        account : req.account[0]
    })
})

router.delete('/posts/:post_id', async (req, res) => {
    await query(`DELETE FROM post WHERE id=${req.params.post_id}`)
    await query(`INSERT INTO admin_actions (create_time, admin, action) VALUES(NOW(), ?, ?)`, [req.account[0].nnid, `Deleted Post : ${req.params.post_id}`])

    res.sendStatus(200)
})

router.get('/communities/:id/posts', async (req, res) => {
    const posts = JSON.parse(await UIQuery.getPosts(req.params.id, 999, 0))

    res.render('admin/admin_community', {
        posts : posts,
        account : req.account[0]
    })
})

router.put('/communities/:id', async (req, res) => {
    await query(`UPDATE community SET name=?, description=?, title_ids=?, type=?, recommended=?, app_jumpable=1 WHERE community_id=?`, [req.body.name, req.body.description, req.body.title_ids, req.body.type, req.body.recommended, req.params.id])
    await query(`INSERT INTO admin_actions (create_time, admin, action) VALUES(NOW(), ?, ?)`, [req.account[0].nnid, `Altered community : ${req.body.name}`])

    fs.writeFileSync(path.join(__dirname, `../../routes/api/v1/files/encoded/${req.params.id}.txt`), req.body.icon)

    res.sendStatus(200)
})

module.exports = router