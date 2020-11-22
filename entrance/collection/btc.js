const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const btcHelper = require("../../lib/btc");
const log4js = require('../../core/logging');
const main = require('../../server/collection/btc');
const log = log4js.getLogger();

// btc类型归集
(async () => {
    let arguments = process.argv.splice(2);
    let cid = arguments[0];
    let pointID = arguments[1]
    console.log("cid-->",cid)
    console.log("pointID-->",pointID)
    let currency, btcClient, conn, rpcInfo;

    async.forever(
        function (callback) {
            (async () => {
                try {
                    conn = await baseDao.transactionStart();

                    currency = await commonDB.getCurrency({cid});
                    rpcInfo = await commonDB.getRPC({pointID});
                    // 获取btc客户端
                    btcClient = btcHelper.init({
                        host: rpcInfo.url,
                        port: rpcInfo.port,
                        user: rpcInfo.username,
                        pass: rpcInfo.password
                    });
                    let params = {
                        log,
                        btcClient,
                        conn,
                        cid,
                        currency,
                        rpcInfo
                    };
                    await main(params);
                    await baseDao.connCommit(conn);
                    setTimeout(() => {
                        callback();
                    }, 1000 * 60);
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
                    }, 1000 * 60);
                }
            })();
        },
        function (err) {
            console.log(err);
            process.exit(2);
        }
    );

    /*
     * 归集
     */

})();