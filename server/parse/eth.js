const commonDB = require("../../model/common/common");
const parseDB = require("../../model/parse/btc");
async function main(params) {
    // 获取所有status为0的
    let list = await commonDB.getRechargeList(0, params.cid, "");
    console.log("list-->",list);
    // 重新解析hash
    let {list_r, list_c} = await getTransactions(list,params);
    // 更新用户资产和充值记录
    await parseDB.rechargeUpdate(list_r, params.conn);
    await parseDB.currencyUserUpdate(list_c, params.conn);
}

async function getTransactions(list, params) {
    let list_r = [];
    let list_c = [];
    for (let i in list) {
        let item = list[i];
        let res = await params.provider.getTransaction(item.txHash);
        console.log("params.currency.confirmations-->",params.currency.confirmations);
        console.log("res.confirmations-->",res.confirmations);
        if (res.confirmations >= params.currency.confirmations) {
            // 1.更新状态和确认数
            list_r.push({
                status: 1,
                confirmations: res.confirmations,
                txHash: item.txHash,
            });

            // 2.更新用户资产
            list_c.push({
                amount: item.amount,
                uid: item.uid,
                cid: item.currency_id,
            });
        } else {
            // 1.更新区块确认数
            list_r.push({
                status: 0,
                confirmations: res.confirmations,
                txHash: item.txHash,
            });
        }
    }
    return {
        list_r, list_c
    }
}

module.exports = main;