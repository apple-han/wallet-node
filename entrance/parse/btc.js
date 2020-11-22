const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const btcHelper = require("../../lib/btc");
const log4js = require('../../core/logging');
const main = require('../../server/parse/btc');
const log = log4js.getLogger();
(async () => {
    // 重新解析txHash, 更新用户资产、区块确认数、充值状态

    // 1. 获取cid
    let arguments = process.argv.splice(2);
    let cid = arguments[0];
    let pointID = arguments[1]
    let params, conn;
    async.forever(
        function (callback) {
            (async () => {
                try{
                    conn = await baseDao.transactionStart();

                    let currency = await commonDB.getCurrency({cid});
                    let rpcInfo = await commonDB.getRPC({pointID});
                    // 获取btc客户端
                    let btcClient = btcHelper.init({
                        host: rpcInfo.url,
                        port: rpcInfo.port,
                        user: rpcInfo.username,
                        pass: rpcInfo.password
                    });
                    // 这里不能用全局变量
                    params = {
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
            log.error(e);
        }
    );
})();