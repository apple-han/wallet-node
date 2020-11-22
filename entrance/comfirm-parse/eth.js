const eth = require("../../server/confirm-parse/eth");
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
                await eth.extract(pointID);
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