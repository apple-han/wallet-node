const baseDao = require("../../model/base/base");
const async = require("async");
const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");
const web3Helper = require("../../lib/web3");
const log4js = require('../../core/logging');
const main = require('../../server/collection/erc20');
const log = log4js.getLogger();

// erc20 归集
(async () => {
    // 1. 获取cid
    let arguments = process.argv.splice(2);
    let cid = arguments[0];
    let pointID = arguments[1];
    let circle = pointID == 8 ? 5 : 120; // 根据节点，设置循环时间

    let conn;
    async.forever(
        function (callback) {
            (async () => {
                try {
                    conn = await baseDao.transactionStart();

                    let currency = await commonDB.getCurrency({cid});

                    let provider = ethHelper.provider(currency.rpc_url);
                    web3Helper.init(currency.rpc_url, currency.password);
                    // web3合约对象
                    let web3Contract = web3Helper.web3Contract(JSON.parse(currency.abi), currency.contract_address);
                    // ethers合约对象
                    let contract = ethHelper.contract(currency.abi, currency.contract_address, provider);
                    // 手续费价格
                    let gasPrice = (await provider.getGasPrice()).mul(15).div(10);

                    let params = {
                        currency,
                        provider,
                        log,
                        cid,
                        web3Contract,
                        contract,
                        gasPrice,
                        conn
                    };
                    await main(params);
                    await baseDao.connCommit(conn);
                    setTimeout(() => {
                        callback();
                    }, 1000 * circle);
                } catch (e) {
                    log.error(e);
                    try {
                        await baseDao.connRollback(conn);
                    } catch (e) {
                        console.log("回滚失败")
                    }
                    setTimeout(() => {
                        callback();
                    }, 1000 * circle * 2);
                }
            })();
        },
        function (err) {
            log.error(err);
        }
    );
})();