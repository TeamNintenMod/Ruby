const express = require('express')
const router = express.Router()

const xmltojson = require('xml-js')

router.get('/home', function(req, res) {

    const { nnid, password, token } = req.cookies

    fetch(`http://localhost:80/v1/people/person?nnid=${nnid}`).then(response => response.text()).then((accountFetch) => {
        const account = JSON.parse(accountFetch)

        fetch('http://localhost:80/v1/communities/0/posts?limit=10').then(response => response.text()).then((postsFetch) => {

        const xmlToJSON = xmltojson.xml2json(postsFetch, {ignoreDoctype : true})

        const posts = JSON.parse(xmlToJSON)

        console.log(posts.elements[0].elements[5].elements)
        
            res.render('pages/home', {
                account : account,
                posts : posts.elements[0].elements[5].elements
            })
        })
    })
})

router.get('/post', function(req, res) {
    res.render('pages/post.ejs')
})

module.exports = router