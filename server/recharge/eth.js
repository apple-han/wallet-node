const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");

async function main(params) {
    // 1.获取起始区块号
    let {begin, end} = await commonDB.getBlockNumber(params);
    if ((end - begin) > 10) {
        end = begin + 10;
    }
    if (end == begin) return;
    // 2.获取blockHash
    let hashs = await getBlockHash({params, begin, end});

    // 3.解析交易hash
    let transactions = await getTransaction(params, hashs);
    if (transactions.length > 0) {
        console.log("\ntransactions:" + JSON.stringify(transactions));
    }
    // 4.增加充值记录
    await commonDB.rechargeAdd(transactions, params.conn);
    // 5.更新区块配置，下次从end开始
    await commonDB.rechargeConfigUpdate(params.cid, end, params.conn);
}

async function getBlockHash({params, begin, end}) {
    let transactions = [];
    for (let i = begin + 1; i <= end; i++) {
        let res = await params.provider.getBlock(i);
        transactions = transactions.concat(res.transactions);
    }
    return transactions;
}

/*
 * 解析交易
 */
async function getTransaction(params, hashs) {
    // 以太坊地址类型为1
    let addresses = await commonDB.getUserAddress(params.currency.crid);
    let transactions = [];
    for (let i in hashs) {
        let hash = hashs[i];
        let t = await params.provider.getTransaction(hash);
        let tR = await params.provider.getTransactionReceipt(hash);
        // 地址是我们地址 && 大于最小充值金额 && 状态是成功状态 && 发送者不能是准备金地址
        if (t !== null && addresses.indexOf(t.to) > -1 &&
            ethHelper.formatUnits(t.value) >= params.currency.rcg_min &&
           tR.status == 1
        ){
            let to = t.to;
            let uid = await commonDB.getUid(to);
            let amount = ethHelper.formatUnits(t.value);
            transactions.push({
                uid,
                cid:params.cid,
                amount,
                address: to,
                txHash: t.hash,
                category: "receive",
                confirmations: t.confirmations
            });
        }
    }
    return transactions;
}

module.exports = main;