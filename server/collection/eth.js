const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");
const web3Helper = require("../../lib/web3");
const ethers = require('ethers');

async function main(params) {
    // 1.查询需要归集的数据
    let list = await commonDB.getRechargeList("", params.cid, 0);
    // 2.归集
    let {collections, recharges} = await collection(params, list);
    // 3.添加归集记录
    await commonDB.collectionAdd(collections, params.conn);
    // 4.修改充值记录归集状态
    await commonDB.rechargeCltUpdate(recharges, params.conn);
}

/*
 * 归集发送eth
 */
async function collection(params, list) {
    let collections = [];
    let recharges = [];
    let txHash;
    for (let i in list) {
        let l = list[i];

        let from = l.address;
        let balance = await params.provider.getBalance(from);
        console.log("balance--->",balance.toString())
        
        if (ethHelper.formatUnits(balance) < params.currency.rcg_min || ethHelper.formatUnits(balance) < 0.001) continue;
        // 基本参数
        let nonce = await params.provider.getTransactionCount(l.address);
        let to = params.rpcInfo.collection;
        let gas = 21000;
        
        let gasPrice = (await params.provider.getGasPrice()).mul(15).div(10);
        console.log("await params.provider.getGasPrice()--->",ethHelper.formatUnits(gasPrice,9))

        console.log("gasPrice.mul(gas)-->",gasPrice.mul(gas))
        let value = balance.sub(gasPrice.mul(gas)); // 避免把手续费归集了
        amount = ethHelper.formatUnits(balance) - ethHelper.formatUnits(ethHelper.formatUnits(gasPrice,9) * 21000, 9) 
        console.log("amount--->",amount)
        console.log("value--->",value)
        // 交易参数
        let overrides = {
            from, to, value, gas, gasPrice,nonce
        };
        if (params.rpcInfo.chain_id !== 0) {
            overrides.chainId = parseInt(params.rpcInfo.chain_id);
        }
        // 先解锁
        await web3Helper.myUnlockAccount({from});
        // 发送交易
        try {
            txHash = await web3Helper.mySendTransaction(overrides);
            console.log("txHash--->",txHash)
        }catch (e) {
            console.error(e)
            continue;
        }
        // 添加归集记录
        collections.push({
            rcg_id: l.id,
            uid: l.uid,
            cid: l.currency_id,
            amount: ethHelper.formatUnits(value),
            from,
            to,
            txHash,
        });
        // 修改充值的归集状态
        recharges.push({
            id: l.id,
            is_clt: 1
        });
    }
    return {collections, recharges};
}

module.exports = main;