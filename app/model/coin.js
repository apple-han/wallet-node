const dao = require('../../model/base/base');

function List({condition}){
    let sql = `SELECT * FROM abc_extract a
               LEFT JOIN abc_currency b ON a.currency_id = b.id
               where a.is_del = 0`;
    let pre = [];
    if ( condition.id !== undefined && condition.id !== '') {
        sql += ` and a.eid = ?`;
        pre.push(condition.id);
    }
    let limit = dao.limit(sql, condition, pre);
    sql = limit.sql;
    pre = limit.pre;
    return dao.query(sql, pre).then((results, fields) => {
        return results;
    }).catch((err) => {
        throw new global.errs.HttpException("数据库查询失败");
    });
}

module.exports = List;