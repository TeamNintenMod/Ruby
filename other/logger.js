const colors = require('colors')
const moment = require('moment')

function Get(input) {
    return `(${moment().format("HH:mm:ss")}) [GET] ${input}`.green
}

function Post(input) {
    return `(${moment().format("HH:mm:ss")}) [POST] ${input}`.purple
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

module.exports = {
    Get,
    Post,
    Info,
    MySQL,
    Error
}