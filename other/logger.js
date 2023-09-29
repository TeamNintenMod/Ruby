const colors = require('colors')
const moment = require('moment')
const fetch = require('node-fetch')

const config = require('../config.json')

function Get(input) {
    return `(${moment().format("HH:mm:ss")}) [GET] ${input}`.green
}

function PostWebhook(mii_image_url, name, body) {
    
    var params = {
        username: "Post Logger",
        embeds: [
            {
                "title": "New Post!",
                "color": 333366,
                "thumbnail": {
                    "url": mii_image_url,
                },
                "fields": [
                    {
                        "name": name,
                        "value": body,
                        "inline": true
                    }
                ]
            }
        ]
    }

    fetch(config.webhook_logger, {
        method : "POST",
        headers : {
            "Content-Type" : 'application/json'
        },
        body : JSON.stringify(params)
    }).then(res => {
        console.log('Sent Webhook!'.green)
    })

}

function Info(input) {
    return `(${moment().format("HH:mm:ss")}) [INFO] ${input}`.green
}

function MySQL(input) {
    return `(${moment().format("HH:mm:ss")}) [MYSQL] ${input}`.blue
}

function Error(input) {
    return `(${moment().format("HH:mm:ss")}) [ERROR] ${input}`.red
}

function Post(input) {
    return `(${moment().format("HH:mm:ss")}) [POST] ${input}`.yellow
}

module.exports = {
    Get,
    Post,
    Info,
    MySQL,
    Error,
    PostWebhook
}