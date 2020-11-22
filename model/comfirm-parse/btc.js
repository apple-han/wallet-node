const baseDao = require("../base/base");
/*
 * 提现审核通过列表
 */
async function getExtract() {
    let sql = `SELECT
                   a.eid,
                   a.txHash,
                   a.currency_id,
                   a.amount,
                   a.uid,
                   b.*
               FROM
                    abc_extract a
               LEFT JOIN abc_currency b ON a.currency_id = b.id
               WHERE
                   a.status = 1
               AND a.txHash != ''
               AND (b.id = 2 or b.id = 20)
               AND b.currency_type = 0 
               AND a.is_del = 0
               AND b.is_del = 0`;
    let pre = [];
    return await baseDao.query(sql, pre);
}

async function getAllExtract() {
    let sql = `SELECT
                   a.eid,
                   a.txHash,
                   a.currency_id,
                   a.amount,
                   a.uid,
                   b.*,
                   c.*
               FROM
                    abc_extract a
               LEFT JOIN abc_currency b ON a.currency_id = b.id
               LEFT JOIN abc_currency_cfg c ON c.cid = b.id
               WHERE
                   a.status = 1
               AND a.txHash != ''
               AND b.id != 2 
               AND b.id != 20
               AND a.is_del = 0
               AND b.is_del = 0`;
    let pre = [];
    return await baseDao.query(sql, pre);
}
/*
 * 设置状态和用户资产
 */
async function setExtract(info) {
    let sql = `update abc_extract set status = 2 where eid = ?`;
    let pre = [info.eid];
    await baseDao.query(sql, pre);
    let sql2 = `update abc_currency_user set number_wtd = number_wtd - ?, number = number - ? where uid = ? and currency_id = ? and is_del = 0`;
    let pre2 = [info.amount, info.amount, info.uid, info.currency_id];
    await baseDao.query(sql2, pre2);
}

/*
 * 归集列表
 */
async function getRecharge() {
    let sql = `SELECT
                   a.txHash,
                   a.currency_id,
                   b.*
               FROM
                    abc_recharge a
               LEFT JOIN abc_currency b ON a.currency_id = b.id
               WHERE
                   a.status = 0
               AND a.txHash != ''
               AND b.id = 2
               AND b.currency_type = 0 
               AND a.is_del = 0
               AND b.is_del = 0`;
    let pre = [];
    return await baseDao.query(sql, pre);
}

/*
 * 更新归集状态
 */
async function setRecharge(info) {
    let sql = `update abc_recharge set is_clt = 1 where txHash = ?`;
    let pre = [info.txHash];
    await baseDao.query(sql, pre);
}

module.exports = {getExtract, setExtract, getRecharge, setRecharge,getAllExtract};