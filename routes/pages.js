const express = require('express')
const router = express.Router()

router.get('/home', function(req, res) {

    const { nnid, password, token } = req.cookies

    fetch(`http://localhost:80/api/account/account?nnid=${nnid}`).then(response => response.text()).then((accountFetch) => {
        const account = JSON.parse(accountFetch)

        fetch('http://localhost:80/api/post/posts').then(response => response.text()).then((postsFetch) => {

        const posts = JSON.parse(postsFetch)
        
            res.render('pages/home', {
                account : account,
                posts : posts
            })
        })
    })
})

router.get('/post', function(req, res) {
    res.render('pages/post.ejs')
})

module.exports = router