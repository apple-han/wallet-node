const baseDao = require("../base/base");



const rechargeUpdate = async (list, conn)=>{
    for (let i in list) {
        let item = list[i];
        let sql = "update abc_recharge set status = ?," +
            "confirmations = ? where txHash = ?";
        let pre = [
            item.status,
            item.confirmations,
            item.txHash
        ];
        await baseDao.execute({conn, sql, pre});
    }
};

const currencyUserUpdate = async(transactionsForCU, conn) => {
    // 先将所有交易按照用户id合并
    let transactions = [];
    for (let i in transactionsForCU) {
        let t = transactionsForCU[i];
        if (!transactions[t.uid]) {
            transactions[t.uid] = t;
        } else {
            transactions[t.uid].amount += t.amount;
        }
    }
    for (let i in transactions) {
        let transaction = transactions[i];
        // 没有记录插入，有则更新
        let sql_c = "select * from currency_user where uid = ? and currency_id = ?";
        let pre_c = [
            transaction.uid,
            transaction.cid
        ];
        let res = await baseDao.query(sql_c, pre_c);
        let sql, pre;
        if (res.length == 0) {
            sql = "insert into currency_user (uid, currency_id, number) values (?,?,?)";
            pre = [
                transaction.uid,
                transaction.cid,
                transaction.amount,
            ];
        } else {
            sql = "update currency_user set number = number + ? where uid = ? and currency_id = ?";
            pre = [
                transaction.amount,
                transaction.uid,
                transaction.cid
            ];
        }
        await baseDao.execute({conn, sql, pre});
    }
};

module.exports = {rechargeUpdate, currencyUserUpdate};