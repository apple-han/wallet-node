const btc = require("../../server/confirm-parse/btc");
const async = require("async");
const log4js = require("../../core/logging");
const log = log4js.getLogger();
/*
 * 解析btc和usdt交易是否完成,这个所需时间较长
 */
async.forever(
    function (callback) {
        setTimeout(async () => {
            try {
                await btc.extract();
                setTimeout(() => {
                    callback();
                }, 2000);
            } catch (e) {
                log.error(e);
                setTimeout(() => {
                    callback();
                }, 2000);
            }

        }, 0);
    },
    function (err) {
        log.error(e);
    }
);