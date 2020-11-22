const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");
const log4js = require('../../core/logging');
const main = require('../../server/recharge/erc20');
const log = log4js.getLogger();

// erc20 归集
(async () => {
    let arguments = process.argv.splice(2);
    let cid = arguments[0];
    let conn;

    async.forever(
        function (callback) {
            (async () => {

                try {
                    conn = await baseDao.transactionStart()
                    let currency = await commonDB.getCurrency({cid});
                    let ethers = ethHelper.init();
                    let provider = ethHelper.provider(currency.rpc_url);

                    let params = {
                        log,
                        ethers,
                        conn,
                        provider,
                        cid,
                        currency
                    };
                    await main(params);
                    await baseDao.connCommit(conn);
                    setTimeout(() => {
                        callback();
                    }, 1000 * 5);
                } catch (e) {
                    log.error(e);
                    try {
                        await baseDao.connRollback(conn);
                    } catch (e) {
                        console.log("回滚失败")
                    }
                    setTimeout(() => {
                        callback();
                    }, 1000 * 10);
                }
            })();
        },
        function (err) {
            log.error(err);
        }
    );
})();