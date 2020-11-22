const commonDB = require("../../model/common/common");
const btcHelper = require("../../lib/btc");
const rpcConfig = require("../../config/rpc");
const comfirmDB = require("../../model/comfirm-parse/btc");

module.exports = {
    async extract(pointID) {
        let list = await comfirmDB.getExtract();
        let rpcInfo = await commonDB.getRPC({pointID});
        for (let i in list) {
            list[i].rpcInfo = rpcInfo
            let is = await isConfirm(list[i]);
            if (is) {
                await comfirmDB.setExtract(list[i]);
            }
        }
    },

    async recharge(pointID) {
        let list = await comfirmDB.getRecharge();
        let rpcInfo = await commonDB.getRPC({pointID});
        for (let i in list) {
            list[i].rpcInfo = rpcInfo
            let is = await isConfirm(list[i]);
            if (is) {
                await comfirmDB.setRecharge(list[i]);
            }
        }
    }
};

/*
 * 交易是否成功
 */
async function isConfirm(info) {
    let cid = info.id
    currency = await commonDB.getCurrency({cid});
    let o = rpcConfig[info.currency_name];
    console.log("info.rpcInfo-->",info.rpcInfo)
    let btcClient = btcHelper.init({
        host: info.rpcInfo.url,
        port: info.rpcInfo.port,
        user: info.rpcInfo.username,
        pass: info.rpcInfo.password
    });
    let res = await btcClient.getTransaction(info.txHash);
    // TODO 正式环境下大于6
    return res.confirmations >= o.confirm;
}