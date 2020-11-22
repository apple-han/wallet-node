const ethHelper = require("../../lib/ethers");
const baseDao = require("../../model/base/base");
const commonDB = require("../../model/common/common");
const web3Helper = require("../../lib/web3");

var provider;
var rpcUrl = "http://15.164.94.128:20006";
(async () => {
    try {
        // 2. 获取rpc、provider
        
        provider = ethHelper.provider(rpcUrl);
        conn = await baseDao.transactionStart();
        await main();
        await baseDao.connCommit(conn);
    } catch (e) {
        console.log(e);
        try {
            await baseDao.connRollback(conn);
        } catch (e) {
            console.log("回滚失败")
        }
        process.exit(2);
    }
})();

async function main() {
    // 查询需要归集的地址与账户密码
    let list = await commonDB.getAccountList();
    for (let i in list) {
        let l = list[i];
        let from = l.address;

        let balance = await provider.getBalance(from);
        
        // 基本参数
        let nonce = await provider.getTransactionCount(l.address);
        let to = "0xa7C6C0066E4d75843F5daA336a61b71F287a3527";
        let gas = 21000;
        
        let gasPrice = (await provider.getGasPrice()).mul(15).div(10);

        let value = balance.sub(gasPrice.mul(gas)); // 避免把手续费归集了
        amount = ethHelper.formatUnits(balance) - ethHelper.formatUnits(ethHelper.formatUnits(gasPrice,9) * 21000, 9) 
        // 交易参数
        let overrides = {
            from, to, value, gas, gasPrice,nonce
        };
        overrides.chainId = 1811;
        web3Helper.init(rpcUrl, l.wallet_password);
        if (amount > 0) {
            console.log("address--->",l.address)
            // 检查还有哪些有问题的账户
            continue
            // 先解锁
            try{
                await web3Helper.myUnlockAccount({from});
            }catch (e) {
                console.error(e)
                continue;
            }
            
            // 发送交易
            try {
                txHash = await web3Helper.mySendTransaction(overrides);
                console.log("txHash--->",txHash)
            }catch (e) {
                console.error(e)
                continue;
            }
        }
        await Ut.sleep(2000);
    }
}

class Ut {
    static sleep(time = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        })
    };
}