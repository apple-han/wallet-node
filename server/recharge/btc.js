const commonDB = require("../../model/common/common");

/*
 * 充值server第一步
 */
async function main(params) {
    // 1.获取所有的交易 listtransactions
    let transactions = await getTransactions(params);
    if (transactions.length > 0)
        params.log.info(transactions);
    // 2.写入到充值记录列表
    await commonDB.rechargeAdd(transactions, params.conn);
}
async function getTransactions(params) {
    // 1.获取交易rpc
    console.log("params.currency.recharge--->",params.rpcInfo.recharge);
    let transactionsRpc = await params.btcClient.listTransactions(params.rpcInfo.recharge, 1000);
    let txHashsBefore = await commonDB.getRechargeTx(params.cid);
    console.log("txHashsBefore--->",txHashsBefore);
    let transaction = [];
    for (let i in transactionsRpc) {
        let transactionRpc = transactionsRpc[i];
        // 判断txId是否存在，如果存在则跳过
        console.log("transactionRpc.txid--->",transactionRpc.txid);
        if (txHashsBefore.indexOf(transactionRpc.txid) > -1  || Math.abs(transactionRpc.amount) < params.currency.rcg_min) continue;
        console.log("transactionRpc.address-->",transactionRpc.address);
        let uid = await commonDB.getUid(transactionRpc.address);
        console.log("uid----->",uid);
        console.log("transactionRpc.category-->",transactionRpc.category);
        transaction.push({
            uid,
            cid: params.cid,
            address: transactionRpc.address,
            amount: Math.abs(transactionRpc.amount),
            txHash: transactionRpc.txid,
            category: transactionRpc.category,
            confirmations: transactionRpc.confirmations
        });
    }

    // 3.修改recharge_tx 表
    let txHash = [];
    for (let i in transactionsRpc) {
        txHash.push(transactionsRpc[i].txid);
    }
    if (txHashsBefore.length === 0){
        await commonDB.InsertTx(JSON.stringify(txHash), params.cid, params.conn)
    }
    await commonDB.rechargeTxUpdate(JSON.stringify(txHash), params.cid, params.conn);
    return transaction;
}

module.exports = main;