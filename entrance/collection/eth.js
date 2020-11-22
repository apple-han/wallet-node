const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const log4js = require('../../core/logging');
const main = require('../../server/collection/eth');
const log = log4js.getLogger();
const ethHelper = require("../../lib/ethers");
const web3Helper = require("../../lib/web3");

// eth 归集
(async () => {

    // 1. 获取cid
    let arguments = process.argv.splice(2);
    let cid = arguments[0];
    let pointID = arguments[1]
    let conn;
    async.forever(
        function (callback) {
            (async () => {
                try {
                    let currency = await commonDB.getCurrency({cid});
                    let rpcInfo = await commonDB.getRPC({pointID});
                    let provider = ethHelper.provider(rpcInfo.url);
                    web3Helper.init(rpcInfo.url, rpcInfo.password);
                    conn = await baseDao.transactionStart();
                    let params = {
                        log,
                        provider,
                        conn,
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
                    setTimeout(() => {
                        callback();
                    }, 1000 * 20);
                }
            })();
        },
        function (err) {
            log.error(err);
        }
    );
})();
