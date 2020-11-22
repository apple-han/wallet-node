const ethHelper = require("../../lib/ethers");
const comfirmDB = require("../../model/comfirm-parse/btc");
const rpcConfig = require("../../config/rpc");
const extractDB = require("../../model/comfirm-parse/eth");

module.exports = {
    async recharge() {
        let list = await comfirmDB.getAllExtract();
        for (let i in list) {
            await isErc20Confirm(list[i]);
        }
    }
}

/*
 * 交易是否成功
 */
async function isErc20Confirm(info) {
    let o = rpcConfig[info.currency_name];
    let provider = ethHelper.provider(o.rpc)

    let res = await provider.getTransactionReceipt(info.txHash);
    let NewestBlcok = await provider.getBlockNumber();
    // TODO 正式环境下大于6
    if (NewestBlcok - res.blockNumber + 1 >= o.confirm){
        await extractDB.updateExtract(info);
    }
    if (res.status == 0){
        await extractDB.failExtract(info);
    }
}