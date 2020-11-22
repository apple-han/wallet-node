const commonDB = require("../../model/common/common");

async function main(params) {
    let accountList = await params.btcClient.listAccounts();

    let recharge = params.rpcInfo.recharge;
    let collection = params.rpcInfo.collection;
    console.log("collection--->",collection);
    if(!accountList.hasOwnProperty(recharge)){
        params.error("recharge account is not exist");
    }
    console.log("recharge--->",params.rpcInfo.recharge);
    let amount = Number(accountList[recharge]);
    console.log("amount--->",amount); // 0.001
    if (amount >= params.currency.rcg_min) {
        // 手续费
        amount -= 0.0002;
        let obj = {};
        console.log("amount---->",Number(amount.toFixed(8)))
        obj[collection] = Number(amount.toFixed(8));

        let txHash = await params.btcClient.sendMany(recharge, obj, 1, "collection");
        await commonDB.collectionAdd([{
            rcg_id: 0, cid: params.cid, amount, from: recharge, to: collection, txHash, uid: 0
        }], params.conn)
    }
}

module.exports = main;