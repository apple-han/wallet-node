const async = require("async");
const ethHelper = require("../../lib/ethers");
const baseDao = require("../../model/base/base");
const commonDB = require("../../model/common/common");

(async () => {
    // 1. 获取cid
    let arguments = process.argv.splice(2);
    let crid = arguments[0];
    let provider, conn, rpc;

    async.forever(
        function (callback) {
            (async () => {
                try {
                    // 2. 获取rpc、provider
                    rpc = await commonDB.getRPC({pointID:crid});
                    provider = ethHelper.provider(rpc.url);
                    conn = await baseDao.transactionStart();
                    await main();
                    await baseDao.connCommit(conn);
                    setTimeout(() => {
                        callback();
                    }, 1000 * 5);
                } catch (e) {
                    console.log(e);
                    try {
                        await baseDao.connRollback(conn);
                    } catch (e) {
                        console.log("回滚失败")
                    }
                    // process.exit(2);
                    setTimeout(() => {
                        callback();
                    }, 1000 * 5);
                }
            })();
        },
        function (err) {
            console.log(err);
        }
    );

    async function main() {
        // 获取所有status为0的
        let listErc20 = await commonDB.getCFeeList({cf_status: 0, crid: crid});
        // 重新解析hash
        let cfUpdates = await getTransactions(listErc20);
        await commonDB.CFeeUpdate(cfUpdates, conn);
    }


    async function getTransactions(listErc20) {
        let cfUpdates = [];
        for (let i in listErc20) {
            let l = listErc20[i];
            let res = await provider.getTransaction(l.txHash);
            if (res && res.confirmations >= 1) {
                // 1.更新状态和确认数
                cfUpdates.push({
                    cf_status: 1,
                    cfid: l.cfid,
                });
            }
        }
        return cfUpdates;
    }
})();

