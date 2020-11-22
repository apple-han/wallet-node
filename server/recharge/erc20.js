const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");

// 每次执行入口处
async function main(params) {
    // 1.获取起始区块号
    let {begin, end} = await getBlockNumber(params);
    if ((end - begin) > 10) {
        end = begin + 10;
    }
    if (end == begin) return;
    // 2.获取满足条件的hash
    let transactions = await getTransferMap({params, begin, end});
    if (transactions.length > 0) {
        console.log("\ntransactions:" + JSON.stringify(transactions));
    }
    // 3.增加充值记录
    await commonDB.rechargeAdd(transactions, params.conn);
    // 4.更新区块配置，下次从end开始
    await commonDB.rechargeConfigUpdate(params.cid, end, params.conn);
}
/*
 * 获取起始查询区块
 */
async function getBlockNumber(params) {
    let end = await params.provider.getBlockNumber();
    let begin = await commonDB.getRechargeConfig(params.cid, end);
    return {begin, end};
}

/*
 * 根据abi，解析合约数据，返回满足条件的transaction
 */
async function getTransferMap({params, begin, end}) {
    // 获取所有地址
    let addresses = await commonDB.getUserAddress(params.currency.id);

    let topic = params.ethers.utils.id("Transfer(address,address,uint256)");
    // console.log("params.currency.contract_address-->",params.currency.contract_address);
    let filter = {
        address: params.currency.contract_address,
        fromBlock: begin + 1,
        toBlock: end,
        topics: [topic]
    };
    // 获取匹配结果
    let logs = await params.provider.getLogs(filter);
    // abcCode解码器
    let abiCode = new params.ethers.utils.Interface(params.currency.abi);
    let transactions = [];
    for (let i in logs) {
        // 日志相关信息
        let info_log = logs[i];
        // 解码字节码数据
        let info_abi = abiCode.parseLog({data: info_log.data, topics: info_log.topics});
        // hash相关
        let info_hash = await params.provider.getTransactionReceipt(info_log.transactionHash);

        let to = info_abi.values['1'];
        let amount = ethHelper.formatUnits(info_abi.values['2'], params.currency.npc);

        if (addresses.indexOf(to) > -1 &&
            amount >= params.currency.rcg_min &&
            info_hash.status == 1
        ) {
            let uid = await commonDB.getUid(to);

            transactions.push({
                uid,
                cid: params.cid,
                amount,
                address: to,
                txHash: info_log.transactionHash,
                category: "receive",
                confirmations: info_hash.confirmations
            });
        }
    }

    return transactions;
}
module.exports = main;