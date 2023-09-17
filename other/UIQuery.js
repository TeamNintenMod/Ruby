const con = require('./mysqlConnection')
const logger = require('./logger')

function getPosts(community_id, limit) {

    var limit = (limit) ? `LIMIT ${limit}` : '';
    const sql = `SELECT * FROM post WHERE community_id=${community_id} ORDER BY id DESC ${limit} `

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })
}

function getCommunities(key, limit) {

    var sql;
    var limit = (limit) ? `LIMIT ${limit}` : '';

    switch (key) {
        case 'newest':
            sql = `SELECT * FROM community WHERE hidden=0 ORDER BY created_at DESC ${limit}`
            break;

        default:
            sql = `SELECT * FROM community WHERE hidden=0 ${limit}`
            break;
    }

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })

}

function getCommunityData(community_id) {
    const sql = `SELECT * FROM community WHERE community_id=${community_id}`

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })
}

module.exports =
{
    getPosts,
    getCommunities,
    getCommunityData
}