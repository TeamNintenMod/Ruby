const con = require('./mysqlConnection')
const logger = require('../other/logger')
const fetch = require('node-fetch')

function authenticateUser(token) {
    return new Promise((resolve, reject) => {
        if (token) {
            con.query(`SELECT * FROM account WHERE banned=0 AND serviceToken="${token.toString().slice(0, 42)}"`, function (err, result, fields) {
                if (err) { throw err }
        
                if (JSON.stringify(result).replace('[]', '')) {
                    console.log(logger.Info('Found account!'))
                    
                    resolve(JSON.stringify(result))
                } else {
                    console.log(logger.Error('Could not find account matching ' + token))
                    reject()
                }
                
            })
        } else {
            console.log(logger.Error("No service token was given. Ignoring."))
            reject()
        }
        
    })
}

module.exports = { authenticateUser }