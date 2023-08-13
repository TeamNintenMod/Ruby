const express = require('express')
const router = express.Router()

const xmltojson = require('xml-js')

const xmlparser = require('fast-xml-parser')

router.get('/post', function(req, res) {
    res.render('pages/post.ejs')
})

router.get('/posts/:community_id', (req, res) => {
    const community_id = req.params.community_id
    const parser = new xmlparser.XMLParser();

    fetch(`http://localhost:80/v1/communities/${community_id}/posts`).then(response => response.text()).then(xmlResult => {
        const xmlFinal = parser.parse(xmlResult)

        res.render('pages/posts.ejs', {
            data : xmlFinal.result.posts
        })
    })
})

module.exports = router