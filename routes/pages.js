const express = require('express')
const router = express.Router()

const xmltojson = require('xml-js')

const xmlparser = require('fast-xml-parser')

router.get('/post', function(req, res) {
    res.render('pages/post.ejs')
})

router.get('/community/:community_id', (req, res) => {
    const community_id = req.params.community_id
    const parser = new xmlparser.XMLParser();

    fetch(`http://localhost:80/v1/communities/${community_id}/posts`).then(response => response.text()).then(xmlResult => {
        const postsXML = parser.parse(xmlResult)
        let postsFound;

        if (postsXML.result.posts.length < 1) {
            postsFound = false
        } else {
            postsFound = true
        }

        fetch(`http://localhost:80/v1/communities/${community_id}`).then(response => response.text()).then(xmlResult => {

            const communityXML = parser.parse(xmlResult)

            res.render('pages/community.ejs', {
                posts : postsXML.result,
                postsFound : postsFound,
                community : communityXML.result.communities.community
            })
        })

        
    })
})

module.exports = router