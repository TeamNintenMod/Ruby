const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

const xmltojson = require('xml-js')

const xmlparser = require('fast-xml-parser')

router.get('/post', function(req, res) {
    res.render('pages/post.ejs')
})

router.get('/community/:community_id', (req, res) => {
    const community_id = req.params.community_id
    const parser = new xmlparser.XMLParser();

    fetch(`https://olvapi.nonamegiven.xyz/v1/communities/${community_id}/posts`).then(response => response.text()).then(xmlResult => {
        const postsXML = parser.parse(xmlResult)
        let postsFound;

        if (postsXML.result.posts.length < 1) {
            postsFound = false
        } else {
            postsFound = true
        }

        fetch(`https://olvapi.nonamegiven.xyz/v1/communities/${community_id}`).then(response => response.text()).then(xmlResult => {

            const communityXML = parser.parse(xmlResult)

            res.render('pages/community.ejs', {
                posts : postsXML.result.posts,
                postsFound : postsFound,
                community : communityXML.result.communities.community
            })
        })

        
    })
})

router.get('/post', (req, res) => {
    res.render('pages/post.ejs')
})

module.exports = router