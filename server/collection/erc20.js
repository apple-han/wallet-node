const commonDB = require("../../model/common/common");
const ethHelper = require("../../lib/ethers");
const web3Helper = require("../../lib/web3");

async function main(params) {
    // 1.查询需要归集的数据
    let list = await commonDB.getRechargeList("", params.cid, 0);

    // 2.归集
    let {collections, recharges} = await collection(list, params);

    // 3.添加归集记录
    await commonDB.collectionAdd(collections, params.conn);

    // 4.修改充值记录归集状态
    await commonDB.rechargeCltUpdate(recharges, params.conn);
}

/*
 * token归集
 */
async function collection(list, params) {
    let collections = [];
    let recharges = [];
    let txHash
    // params.log.info(list);
    for (let i in list) {
        let l = list[i];
        // 判断地址余额
        let from = l.address;
        let amount = await getErc20Balance(params, from);
        if (amount < params.currency.rcg_min || amount == 0) continue;
        let balance = await params.provider.getBalance(from);
        let gasFee = params.gasPrice.mul(90000);

        params.log.info(
            "地址：" + l.address +
            " 余额：" + ethHelper.formatUnits(balance) +
            " 需要手续费：+ " + ethHelper.formatUnits(gasFee) +
            " 归集金额" + amount
        );

        // 如果gasFee > balance 就用这个 转一部分的手续费
        if (gasFee.gt(balance)) {
            params.log.info("开始转手续费环节：")
            // 判断是否已转手续费但还没到账
            let cnt = await commonDB.getCFeeCount({to: from, cf_status: 0});
            if (cnt < ethHelper.formatUnits(gasFee)) {
                // if (params.cid == 44) { // etsl多了一个授权环节，要多转一次
                //     await transferEth({params, to: from, amount: gasFee * 2})
                // } else {
                await transferEth({params, to: from, amount: gasFee})
                // }
            }
        } else {
            // 如果是etsl判断是否已经认证
            // if (params.cid == 44) {
            //     let middle = await getErc20Allowance({params, from, to: from})
            //     if (middle && middle > 0) {
            //         params.log.info("etsl归集环节：")
            //         txHash = await transferFromToken({params, from, amount})
            //     } else {
            //         params.log.info("etsl授权环节：")
            //         await approveToken({params, from, to: from, amount: 99999999999})
            //         continue;
            //     }
            // } else {
                params.log.info("归集环节：");
                txHash = await transferToken({params, from, amount});
            // }
            collections.push({
                rcg_id: l.id,
                uid: l.uid,
                cid: l.currency_id,
                amount,
                from,
                to: params.rpcInfo.collection,
                txHash,
            });
            // 修改充值的归集状态
            recharges.push({
                id: l.id,
                is_clt: 1
            });
        }
    }
    return {collections, recharges};
}

async function PreFixInterge(num, n) {
    //num代表传入的数字，n代表要保留的字符的长度
    return (Array(n).join(0) + num).slice(-n);
}

async function getErc20Balance(params, address) {
    let balance = await params.contract.balanceOf(address);
    return ethHelper.formatUnits(balance, params.currency.npc);
}

async function getErc20Allowance({params, from, to}) {
    let balance = await params.contract.allowance(from, to);
    return ethHelper.formatUnits(balance, params.currency.npc);
}

async function getErc20BalanceSecond(params, address) {
    let balance = await params.contract.balanceOf(address);
    return balance;
}

/*
 * 归集token
 */
async function transferToken({params, from, amount}) {
    let gasPrice = (await params.provider.getGasPrice()).mul(15).div(10);
    // 1.先解锁
    await web3Helper.myUnlockAccount({from});
    let nonce = await params.provider.getTransactionCount(from);
    // 2.广播请求
    let overrides = {
        gasPrice, from, gas: 90000, nonce
    };
    if (params.currency.chain_id != 0) {
        overrides.chainId = parseInt(params.currency.chain_id);
    }
    console.log("ethHelper.parseUnits(amount.toString(), params.currency.npc)--->", ethHelper.parseUnits(amount.toString(), params.currency.npc))
    console.log("params.currency.npc-->", params.currency.npc)
    let txHash = await web3Helper.contractTransfer(params.web3Contract, ethHelper.parseUnits(amount.toString(), params.currency.npc), params.currency.collection, overrides);
    return txHash
}

/*
 * 归集token
 */
async function transferFromToken({params, from, amount}) {
    let gasPrice = (await params.provider.getGasPrice()).mul(15).div(10);
    // 1.先解锁
    await web3Helper.myUnlockAccount({from});
    let nonce = await params.provider.getTransactionCount(from);
    // 2.广播请求
    let overrides = {
        gasPrice, from, gas: 90000, nonce
    };
    if (params.rpcInfo.chain_id != 0) {
        overrides.chainId = parseInt(params.rpcInfo.chain_id);
    }
    console.log("ethHelper.parseUnits(amount.toString(), params.currency.npc)--->", ethHelper.parseUnits(amount.toString(), params.currency.npc))
    console.log("params.currency.npc-->", params.currency.npc)
    return await web3Helper.contractTransferFrom({
            web3Contract: params.web3Contract,
            amount: ethHelper.parseUnits(amount.toString(), params.currency.npc),
            from,
            to: params.rpcInfo.collection,
            overrides
        }
    );
}

/*
 * 归集token
 */
async function approveToken({params, from, to, amount}) {
    let gasPrice = (await params.provider.getGasPrice()).mul(15).div(10);
    // 1.先解锁
    await web3Helper.myUnlockAccount({from});
    let nonce = await params.provider.getTransactionCount(from);
    // 2.广播请求
    let overrides = {
        gasPrice, from, gas: 90000, nonce
    };
    if (params.rpcInfo.chain_id != 0) {
        overrides.chainId = parseInt(params.rpcInfo.chain_id);
    }
    console.log("ethHelper.parseUnits(amount.toString(), params.currency.npc)--->", ethHelper.parseUnits(amount.toString(), params.currency.npc))
    console.log("params.currency.npc-->", params.currency.npc)
    return await web3Helper.contractApprove({
        web3Contract: params.web3Contract,
        amount: ethHelper.parseUnits(amount.toString(), params.currency.npc),
        to, overrides
    });
}

/*
 * 归集etsl token
 */

// var nonce = 2118;
/*async function send_etsl({params, from, middle_amount}) {
    await web3Helper.myUnlockAccount({from});
    let plus_form = await PreFixInterge(from.substring(2), 64)
    let value_etsl = await PreFixInterge(middle_amount, 64)
    // let value_etsl = "5540a25f9e31c0000"
    console.log("value_etsl--->", value_etsl)
    let value = "0x0"
    let gas = 90000;
    let plus_data = await PreFixInterge(params.rpcInfo.collection.substring(2), 64)
    let data = '0x23b872dd' + plus_form + plus_data + value_etsl;
    // let nonce = await params.provider.getTransactionCount(from);
    // console.log("nonce--->",nonce)
    // nonce ++;
    // console.log("nonce-->",nonce);
    let gasPrice = "0x" + "1406f40";
    let to = params.currency.contract_address
    let overrides = {
        from, to, value, gas, gasPrice, data, nonce
    }
    console.log("overrides-->", overrides)
    let txHash = await web3Helper.mySendTransaction(overrides);
    return txHash
}*/

/*
 * 认证etsl
 */
/*async function approve_etsl(params, from, amount) {
    await web3Helper.myUnlockAccount({from});
    console.log("from--->", from)
    let plus_form = await PreFixInterge(from.substring(2), 64)
    console.log("plus_form-->", plus_form)
    let middle_amount = await getvalue_etsl(amount)
    console.log("middle_amount--->", middle_amount)
    let value_etsl = await PreFixInterge(middle_amount, 64)
    let value = "0x0"
    let gas = 90000;
    let data = '0x095ea7b3' + plus_form + plus_form + value_etsl;
    let to = params.currency.contract_address
    let gasPrice = "0x" + "1406f40";
    // let nonce = await params.provider.getTransactionCount(from);
    let overrides = {
        from, to, value, gas, gasPrice, data
    }
    console.log("overrides approve-->", overrides)
    let txHash = await web3Helper.mySendTransaction(overrides);
    console.log("txHash--->", txHash)
    return txHash
}*/

/*async function getapprove_etsl(params, from) {
    let plus_form = await PreFixInterge(from.substring(2), 64)
    let data = '0xdd62ed3e' + plus_form + plus_form;
    let to = params.currency.contract_address
    let log
    let overrides = {
        from, to, data
    }
    console.log("overrides-getapprove--", overrides)
    try {
        log = await web3Helper.call(overrides);
    } catch (error) {
        log = 0
    }
    console.log("log---->", log);
    if (log !== null) {
        value = log.toString(10);
        value = value / (10 ** 18);
    } else {
        value = 0
    }
    return value;
}*/


/*
async function getvalue_etsl(value) {
    middle = value * (10 ** 18)
    return middle.toString(16)
}
*/


async function transferEth({params, to, amount}) {
    params.log.info(`send eth to ${to} amount ${ethHelper.formatUnits(amount, 18)}`);
    // 基本参数
    let from = params.currency.reserve;
    console.log("from--->", params.currency.reserve);
    let gas = 21000;
    console.log("amount--->", ethHelper.formatUnits(amount, 18));
    // 交易参数
    let overrides = {
        from, to, value: amount, gas, gasPrice: params.gasPrice
    };
    if (params.currency.chain_id != 0) {
        overrides.chainId = parseInt(params.currency.chain_id);
    }

    // 先解锁
    await web3Helper.myUnlockAccount({from});
    // 发送交易
    let txHash = await web3Helper.mySendTransaction(overrides);
    // 增加充值记录
    await commonDB.CFeeAdd([{
        from, to, amount: ethHelper.formatUnits(amount), crid: params.currency.id, txHash
    }], params.conn);
}

module.exports = main;