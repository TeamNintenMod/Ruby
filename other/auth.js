const con = require('./mysqlConnection')
const logger = require('../other/logger')

function authenticateUser(token) {

    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM account WHERE serviceToken="${token.slice(0, 42)}"`, function (err, result, fields) {
            if (err) { throw err }
    
            if (JSON.stringify(result).replace('[]', '')) {
                console.log(logger.Info('Found account!'))
                
                resolve(JSON.stringify(result))
            } else {
                console.log(logger.Error('Could not find account matching that token..'))
                reject()
            }
            
        })
    })

    
}

module.exports = { authenticateUser }