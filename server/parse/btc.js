const parseDB = require("../../model/parse/btc");
const commonDB = require("../../model/common/common");

async function main(params) {
    // 1.查找到所有btc类型的充值未成功记录
    let recharges = await commonDB.getRechargeList(0, params.cid, "");
    console.log("recharges--->",recharges);
    // 2.解析状态
    let {list_r, list_c} = await getTransactions(params, recharges);

    // 更新用户资产和充值记录
    await parseDB.rechargeUpdate(list_r, params.conn);
    await parseDB.currencyUserUpdate(list_c, params.conn);
}

/*
 * 重新解析transaction
 */
async function getTransactions(params, recharges) {
    let list_r = [];
    let list_c = [];
    for (let i in recharges) {
        let recharge = recharges[i];
        let transaction = await params.btcClient.getTransaction(recharge.txHash);
        console.log("transaction.confirmations-->",transaction.confirmations);
        if (transaction.confirmations >= params.currency.confirmations) {
            // 更新区块确认数
            list_r.push({
                status: 1,
                confirmations: transaction.confirmations,
                txHash: recharge.txHash
            });

            // 更新用户资产
            list_c.push({
                amount: recharge.amount,
                uid: recharge.uid,
                cid: recharge.currency_id
            });
        } else {
            // 更新区块确认数
            list_r.push({
                status: 0,
                confirmations: transaction.confirmations,
                txHash: recharge.txHash
            });
        }
    }
    return {
        list_r, list_c
    }
}

module.exports = main;