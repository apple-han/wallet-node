const btc = require("../../server/confirm-parse/btc");
const async = require("async");
const log4js = require("../../core/logging");
const log = log4js.getLogger();
/*
 * 解析btc和usdt交易是否完成,这个所需时间较长
 */
let arguments = process.argv.splice(2);
let pointID = arguments[0]

async.forever(
    function (callback) {
        setTimeout(async () => {
            try {
                await btc.extract(pointID);
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

async.forever(
    function (callback) {
        setTimeout(async () => {
            try {
                await btc.recharge(pointID);
                setTimeout(() => {
                    callback();
                }, 10000);
            } catch (e) {
                console.log(e)
                setTimeout(() => {
                    callback();
                }, 10000);
            }

        }, 0);
    },
    function (err) {
        console.log(err);
    }
);

