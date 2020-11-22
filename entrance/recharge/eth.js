const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");
const web3Helper = require("../../lib/web3");
const log4js = require('../../core/logging');
const main = require('../../server/recharge/eth');
const log = log4js.getLogger();

//// eth 归集
(async () => {
    // 1. 获取cid
    let arguments = process.argv.splice(2);
    let cid = arguments[0];
    let pointID = arguments[1];
    let conn;

    async.forever(
        function (callback) {
            (async () => {
                try {
                    conn = await baseDao.transactionStart();

                    let currency = await commonDB.getCurrency({cid});
                    let rpcInfo = await commonDB.getRPC({pointID});
                    let provider = ethHelper.provider(rpcInfo.url);
                    web3Helper.init(rpcInfo.url, rpcInfo.password);
                    let params = {
                        log,
                        conn,
                        provider,
                        cid,
                        currency,
                        rpcInfo
                    };
                    await main(params);
                    await baseDao.connCommit(conn);
                    setTimeout(() => {
                        callback();
                    }, 1000 * 20);
                } catch (e) {
                    log.error(e);
                    try {
                        await baseDao.connRollback(conn);
                    } catch (e) {
                        console.log("回滚失败")
                    }
                    // process.exit(2);
                    setTimeout(() => {
                        callback();
                    }, 1000 * 20);
                }
            })();
        },
        function (err) {
            log.error(e);
        }
    );
})();
