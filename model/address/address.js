const btcHelper = require("../../lib/btc");
const rpcConfig = require("../../config/config");
const web3Helper = require("../../lib/web3");
const baseDao = require("../base/base");
const baseDaoConsole = require("../base/base_console");
/*
 * 获取最大的uid
 */
async function getUid(crid) {
    let sql = "select max(uid) as uid from currency_user_address where is_del = 0 and currency_id = ?";
    let pre = [crid];
    let res = await baseDao.query(sql, pre);
    return res[0].uid ? res[0].uid : 0;
}

/*
 * 获取user 列表
 */
async function getUserList(uid) {
    let sql = `select * from  user where uid > ${uid} and status = 0`;
    return await baseDao.query(sql);
}

// btc 地址类型 ==> 0
async function btc(uid, rpc) {
    btcHelper.init({
        host: rpc.url,
        port: rpc.port,
        user: rpc.username,
        pass: rpc.password
    });

    let address = await btcHelper.getNewAddress(rpc.recharge);
    let HashAddress = await RequireMd5(address)
    
    let sql = "INSERT INTO `abc_user_address` (`uid`, `crid`, `address`, `hash_address`) VALUES (?, ?, ?,?);";
    let pre = [uid, rpc.crid, address,HashAddress];
    await baseDao.query(sql, pre)

    let sqlConsole = "INSERT INTO `abc_user_address` (`uid`, `crid`, `address`, `hash_address`) VALUES (?, ?, ?,?);";
    let preConsole = [uid, rpc.crid, address,HashAddress];
    await baseDaoConsole.query(sqlConsole, preConsole)

}

// eth 地址类型 ==> 1
async function eth(uid, rpc) {
    web3Helper.init(rpc.url, rpc.password);
    let address = await web3Helper.newAccount();
    let sqlConsole = "INSERT INTO `currency_user_address` (`uid`, `currency_id`, `address`) VALUES (?, ?, ?);";
    let preConsole = [uid, rpc.id, address];
    await baseDaoConsole.query(sqlConsole, preConsole)
}

async function RequireMd5(str) {
    var crypto = require('crypto');
    var Base64 = require('js-base64').Base64;
    var result = crypto.createHash('md5').update(str).digest("hex");
    return Base64.encode(result + rpcConfig.salt);
}

module.exports = {getUid,getUserList,btc,eth};