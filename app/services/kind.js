const ethers = require('ethers');
const baseDao = require('../../model/base/base');
const Client = require('bitcoin-core');
const OmniClient = require('../../lib/OmniClient.js').OmniClient;
const ethHelper = require("../../lib/ethers");
const rpcConfig = require("../../config/rpc");
const extractConfig = require("../../config/extract");
const web3Helper = require("../../lib/web3");
const commonDB = require("../../model/common/common");

module.exports = {
    async btc(data) {
        // 获取相关的数据
        let currency = await commonDB.getCurrency({cid: data.id});
        let rpcInfo = await commonDB.getRPC({pointID:data.rpc_id});
        let client = new Client({
            host: rpcInfo.url,
            password: rpcInfo.password,
            username: rpcInfo.username,
            port: rpcInfo.port,
        });
        console.log("rpcInfo---->",rpcInfo)
        let amount = Number(data.amount * (1 - data.poundage).toFixed(8));
        console.log("amount----->",amount)
        let tx = await client.sendToAddress(data.to, amount, "extract", "BiDank");
        let up_sql = `update abc_extract set txHash = ?, status = 1 where eid = ?`;
        // TODO btc 转账成功判断
        await baseDao.query(up_sql, [tx, data.eid]);

        let up_sql_trans = `update app_currency_trans set status = 1 where transid = ?`;
        await baseDao.query(up_sql_trans, [data.eid]);
    },

    async usdt(data) {
        // usdt客户端
        let omniClient = new OmniClient({
            host: rpcConfig[data.currency_name].rpc,
            port: rpcConfig[data.currency_name].port,
            user: rpcConfig[data.currency_name].username,
            pass: rpcConfig[data.currency_name].password
        });
        let amount = data.amount * (1 - data.poundage);
        let tx = await omniClient.omniFundedSend(
            extractConfig.btc.temp.address,
            data.to,
            rpcConfig.USDT.propertyid,
            amount,
            extractConfig.btc.temp.address
        );
        let up_sql = `update abc_extract set txHash = ?, status = 1 where eid = ?`;
        // TODO usdt 转账成功判断
        await baseDao.query(up_sql, [tx, data.eid]);
    },

    /*
     * eth 提现
     */
    async eth(data) {
        // 1.获取相关参数
        let final;
        let currency = await commonDB.getCurrency({cid: data.id});
        let rpcInfo = await commonDB.getRPC({pointID:data.rpc_id});
        web3Helper.init(rpcInfo.url, rpcInfo.password);
        let provider = ethHelper.provider(rpcInfo.url)
        let to = data.to;
        let from = rpcInfo.reserve;
        let txHash
        if (data.currency_id == 17){
            final = ethers.utils.parseEther((data.amount * (1 - data.poundage)).toString())
        }else{
            final = ethers.utils.parseEther((data.amount  - data.poundage).toString())
        }
        
        // 2.广播请求
        let overrides = {
            // 准备金地址
            from: from,
            to: to,
            gasPrice : (await provider.getGasPrice()).mul(15).div(10),
            gas: ethers.utils.bigNumberify("21000"),
            value: final,
        };

        console.log("final-->",final)
        if ((currency.id === 17) && (data.amount > 1)){
            overrides.value = final.mul(992).div(1000)
            console.log("overrides.value--->",overrides.value)
        }
        if (rpcInfo.chain_id !== 0) {
            // 这可确保无法在不同网络上重复广播
            overrides.chainId = ethers.utils.getNetwork('homestead').chainId;
            if (currency.id === 17){
                overrides.chainId = 1811;
            }
        }
         // 先解锁
         await web3Helper.myUnlockAccount({from});
         try {
             txHash = await web3Helper.mySendTransaction(overrides);
         }catch (e) {
             console.log("e value is-->",e)
         }
          // 去更新txhash
          let tx_up_sql = `update abc_extract set txHash = ?, status = 1 where eid = ?`;
          await baseDao.query(tx_up_sql, [txHash, data.eid]);
             // 发送交易
        if ((currency.id === 17) && (data.amount > 1)){
            overrides.value = final.mul(8).div(1000)

            console.log("overrides.value-2-->",overrides.value)
            overrides.to = "0x0000000000000000000000000000000000000000" 
            try {
                txHash = await web3Helper.mySendTransaction(overrides);
                console.log("txHash2--->",txHash)
            }catch (e) {
                console.log("e value is-->",e)
            }
        } 
    },
    /*
     * erc20 代币提现
     */
    // async toNonExponential(num) {
    //     var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    //     return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    // };
 

    async erc20(data) {
        // 1.获取相关参数
        let middle_amount
        let currency = await commonDB.getCurrency({cid: data.id});
        let rpcInfo = await commonDB.getRPC({pointID:data.rpc_id});
        web3Helper.init(rpcInfo.url, rpcInfo.password);
        let ETHProvider = ethHelper.provider(rpcInfo.url);
        let txHash
        // web3合约对象
        let web3Contract = web3Helper.web3Contract(JSON.parse(currency.abi), currency.contract_address);
        let to = data.to;
        let from = rpcInfo.reserve
        let nonce = await ETHProvider.getTransactionCount(from);

        let gasPrice = (await ETHProvider.getGasPrice()).mul(15).div(10);
        await web3Helper.myUnlockAccount({from});
        // 2.广播请求
        let overrides = {
            gasPrice, from, gas: 90000, nonce
        };
        if (rpcInfo.chain_id != 0) {
            overrides.chainId = parseInt(rpcInfo.chain_id);
        }

        if (data.currency_id != 44){
            middle_amount = (Math.floor((data.amount - data.poundage)*1000000)/1000000).toString();
        }else{
            middle_amount = (Math.floor((data.amount * (1 - data.poundage))*1000000)/1000000).toString();
        }

        if (data.amount < currency.wtd_min){
            throw new global.errs.ParameterException("提现金额不足", 10004);
        }
        console.log(ethHelper.parseUnits(middle_amount.toString(), currency.npc))
        try{
            txHash = await web3Helper.contractTransfer(web3Contract, ethHelper.parseUnits(middle_amount.toString(), currency.npc), to, overrides);
        }catch(error){
            throw new global.errs.HttpException("提现失败");
        }
        let up_sql = `update abc_extract set txHash = ?, status = 1 where eid = ?`;
        await baseDao.query(up_sql, [txHash, data.eid]);
    }
};
