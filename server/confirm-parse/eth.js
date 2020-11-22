const ethHelper = require("../../lib/ethers");
const comfirmDB = require("../../model/comfirm-parse/btc");
const extractDB = require("../../model/comfirm-parse/eth");
const commonDB = require("../../model/common/common");

module.exports = {
    async extract(pointID) {
        let list = await comfirmDB.getAllExtract();
        let rpcInfo = await commonDB.getRPC({pointID});

        for (let i in list) {
            list[i].url = rpcInfo.url
            await isEthConfirm(list[i]);
        }
    }
}

/*
 * 交易是否成功
 */
async function isEthConfirm(info) {
    let provider = ethHelper.provider(info.url)
    let res = await provider.getTransactionReceipt(info.txHash);
    let NewestBlcok = await provider.getBlockNumber();
    console.log("NewestBlcok--->",NewestBlcok)
    console.log("res.blockNumber--->",res.blockNumber)
    // TODO 正式环境下大于6
    console.log("id--->",info.eid)
    if (NewestBlcok - res.blockNumber + 1 >= info.confirmations){
        await extractDB.updateExtract(info);
    }
    if (res.status == 0){
        await extractDB.FailExtract(info);
    }
}