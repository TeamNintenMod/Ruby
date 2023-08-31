const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

const xmltojson = require('xml-js')

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../other/headerDecoder')

const en = require('../languages/en.json')
const logger = require('../other/logger')

router.get('/show', (req, res) => {

    let serviceToken;
    let paramPack;
    const regExp = new RegExp("/+/", 'g')

    if(req.get('x-nintendo-parampack') && req.get('x-nintendo-servicetoken')) {
        serviceToken = req.get('x-nintendo-servicetoken').slice(0, 42)
        paramPack = headerDecoder.decodeParamPack(req.get('x-nintendo-parampack'))

        console.log(logger.Info('Found Service Token And/Or ParamPack'))
    } else {
        serviceToken = 0
        paramPack = 0

        console.log(logger.Error('Did not find any Service Token or ParamPack. Setting both values to "0" as default.'))
    }

    fetch(`https://olvapi.nonamegiven.xyz/v1/people/person?token=${serviceToken}`).then(response => response.text()).then(result => {
        if (result) {
            const account = JSON.parse(result)

            console.log(logger.Get(req.originalUrl))

            const parser = new xmlparser.XMLParser();

            fetch('https://olvapi.nonamegiven.xyz/v1/communities?json=1').then(response => response.text()).then((xmlResult) => {

                var communities = JSON.parse(xmlResult)

                res.render('./pages/index.ejs', {
                    account : account,
                    communities : communities
            })
    });
        } else {
            res.redirect('https://olvportal.nonamegiven.xyz/titles/newUser')
        }
    })

    
})

router.get('/first', (req, res) => {
    console.log(logger.Get(req.originalUrl))
})

router.get('/newUser', (req, res) => {
    res.render('./pages/newuser/startup.ejs', {
        language : en
    })
})

router.get('/', (req, res) => {
    console.log(logger.Get(req.originalUrl))
})

router.get('/newUser/1', (req, res) => {
    res.render('./pages/newuser/nnidcreation.ejs', {
        language : en
    })
})

router.get('/post', function(req, res) {
    res.render('pages/post.ejs')
})

router.get('/:community_id', async function(req, res) {
    const community_id = req.params.community_id
    const parser = new xmlparser.XMLParser();

    let serviceToken = req.get('x-nintendo-servicetoken')
    if (!serviceToken) {
        serviceToken = "0"
        console.log(logger.Error('Found no service token, replacing with default values.'))
    }

    fetch(`https://olvapi.nonamegiven.xyz/v1/communities/${community_id}/posts?json=1`).then(response => response.text()).then(result => {
        const postsJson = JSON.parse(result)

        fetch(`https://olvapi.nonamegiven.xyz/v1/communities/${community_id}?json=1`).then(response => response.text()).then(function(result){

            const communityJson = JSON.parse(result)

            fetch(`https://olvapi.nonamegiven.xyz/v1/people/person?token=${serviceToken.slice(0, 42)}`).then(response => response.text()).then(result => {
                let account; var posts;

                account = JSON.parse(result)            
                
                res.render('pages/community.ejs', {
                    posts : postsJson,
                    community : communityJson[0],
                    account : account
                })
            }); 
            
        })          
    })
})

router.get('/post/:title_id', (req, res) => {
    const title_id = req.params.title_id

    res.render('pages/post.ejs', {
        title_id : title_id
    })
})

module.exports = router