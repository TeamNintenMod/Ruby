const express = require('express')
const router = express.Router()

const xmlparser = require('fast-xml-parser')
const headerDecoder = require('../../other/decoder')

const en = require('../../languages/en.json')
const logger = require('../../other/logger')

const moment = require('moment')

const config = require('../../config.json')

const UIQuery = require('../../other/UIQuery')