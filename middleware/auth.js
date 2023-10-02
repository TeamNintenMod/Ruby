const config = require('../config.json')
const con = require('../other/mysqlConnection')

const logger = require('../other/logger')
const language = require('../other/language')

const util = require('util')

const query = util.promisify(con.query).bind(con)

function auth(req, res, next) {
    if (req.path.includes('css') || req.path.includes('js') || req.path.includes('img') 
    || req.path.includes('endpoint') || req.path.includes('01') || req.path.includes('02') 
    || req.path.includes('people') || req.path.includes('communities/0/posts')) {
        console.log(logger.Get(req.originalUrl))
        return next()
    } else if (req.path.includes('admin') || req.path.includes('dev') || req.path.includes('test')) {

        switch (req.method) {
            case "GET":
                console.log(logger.Get(req.originalUrl))
                break;
            case "POST":
                console.log(logger.Post(req.originalUrl))
                break;
            case "PUT":
                console.log(logger.Put(req.originalUrl))
                break;
            case "DELETE":
                console.log(logger.Delete(req.originalUrl))
                break;
            default:
                break;
        }

        var service_token = (req.get('x-nintendo-servicetoken')) ? req.get('x-nintendo-servicetoken') : config.guest_token

        con.query(`SELECT * FROM account WHERE admin=1 AND serviceToken="${service_token.toString().slice(0, 42)}"`, async function (err, result, fields) {
            if (err) { throw err }

            if (result[0]) {
                req.account = result
                req.language = language.getUserLanguage(result[0])
                next()
            } else {
                res.render('unauthorized.ejs')
                console.log(logger.Error(`${service_token} tried to access admin panel.`))
            }
        })
    } else {
        
        switch (req.method) {
            case "GET":
                console.log(logger.Get(req.originalUrl))
                break;
            case "POST":
                console.log(logger.Post(req.originalUrl))
                break;
            default:
                break;
        }

        var service_token = (req.get('x-nintendo-servicetoken')) ? req.get('x-nintendo-servicetoken') : config.guest_token

        con.query(`SELECT * FROM account WHERE serviceToken="${service_token.toString().slice(0, 42)}"`, async function (err, result, fields) {
            if (err) { throw err }

            if (result[0]) {

                const ban = await query(`SELECT * FROM bans WHERE pid=${result[0].pid}`)

                if (ban[0]) {res.status(403).render('ban.ejs', {reason : ban[0].reason}); return;}

                req.account = result
                req.language = language.getUserLanguage(result[0])
                return next()
            } else {
                console.log(logger.Error('Could not find account matching ' + service_token.toString().slice(0, 42)))
                res.status(401)
                .render('portal/setup/new_user_01.ejs', {
                    language : language.getSetupLanguage()
                })
            }
        })
    }

    
}

module.exports = auth