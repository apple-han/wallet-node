const baseDao = require("../base/base");
/*
 * 更新用户资产状态
 */
async function updateExtract(info) {
    let up_sql = `update abc_extract set status = 2 where eid = ?`;
    await baseDao.query(up_sql, [info.eid]);
    
    let personal = await getUserCurrency(info.eid)
    console.log("personal wtd--->",personal[0].number_wtd)
    let number_wtd = Number((personal[0].number_wtd - info.amount).toFixed(8))
    let number = Number((personal[0].number - info.amount).toFixed(8))
    console.log("personal wtd--->",personal[0].number)
    // 修改资产
    let cu_sql = `update  abc_currency_user  ac join abc_extract ae
        on ac.uid = ae.uid and ac.currency_id = ae.currency_id set 
        ac.number_wtd = ?,
        ac.number = ? 
        where ae.eid = ?`;
    await baseDao.query(cu_sql, [number_wtd, number, info.eid]);
}

async function FailExtract(info){
    let up_sql = `update abc_extract set status = 3 where eid = ?`;
    await baseDao.query(up_sql, [info.eid]);
}

const getUserCurrency = async(eid) =>{
    let sql = `select  * from abc_currency_user ac join abc_extract ae
    on ac.uid = ae.uid and ac.currency_id = ae.currency_id where ae.eid = ?`;
    return await baseDao.query(sql, [eid]);
};

module.exports = {updateExtract,FailExtract};