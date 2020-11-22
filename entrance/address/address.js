const async = require("async");
const baseDao = require("../../model/base/base");
const commonDB = require("../../model/common/common");
const log4js = require('../../core/logging');
const main = require('../../server/address/address');
const log = log4js.getLogger();

let conn, rpcList;
let arguments = process.argv.splice(2);
let cid = arguments[0];

async.forever(
    function (callback) {
        (async () => {
            try {
                conn = await baseDao.transactionStart();

                rpcList = await commonDB.getRpcList(id);
                let params = {
                    log,
                    conn,
                    rpcList
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
                }, 1000 * 5);
            }

        })();
    },
    function (err) {
        log.error(err);
    }
);
