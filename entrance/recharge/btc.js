const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const btcHelper = require("../../lib/btc");
const log4js = require('../../core/logging');
const main = require('../../server/recharge/btc');
const log = log4js.getLogger();

// btc充值操作
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
                    conn = await baseDao.transactionStart()
                    // 获取币种的配置信息
                    let currency = await commonDB.getCurrency({cid});
                    let rpcInfo = await commonDB.getRPC({pointID});
                    // 获取btc客户端
                    let btcClient = btcHelper.init({
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
                    }, 1000 * 10);
                } catch (e) {
                    log.error("recharge btc start:" + e);
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
            log.error("recharge btc start:" + err);
        }
    );
})();