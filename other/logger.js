const colors = require('colors')

function Get(input) {
    const time = new Date()

    return `(${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}) [GET] ${input}`.green
}

function Post(input) {
    const time = new Date()

    return `(${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}) [POST] ${input}`.purple
}

function Info(input) {
    const time = new Date()

    return `(${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}) [INFO] ${input}`.green
}

function MySQL(input) {
    const time = new Date()

    return `(${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}) [MYSQL] ${input}`.blue
}

function Error(input) {
    const time = new Date()

    return `(${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}) [MYSQL] ${input}`.red
}

module.exports = {
    Get,
    Post,
    Info,
    MySQL,
    Error
}