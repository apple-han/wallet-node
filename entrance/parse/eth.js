const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");
const log4js = require('../../core/logging');
const main = require('../../server/parse/eth');
const log = log4js.getLogger();

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

                    // 2. 获取currency、provider
                    let currency = await commonDB.getCurrency({cid});
                    let provider = ethHelper.provider(currency.rpc_url);
                    let params = {
                        currency,
                        provider,
                        conn,
                        log,
                        cid
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

