const baseDao = require("../base/base");
const baseDaoConsole = require("../base/base_console");

const getCurrency = async ({cid = '', type = ''}) =>{
    let sql = `SELECT * FROM currency WHERE is_del = 0 `;
    let pre = [];
    if (cid !== '') {
        sql += ` AND id = ?`;
        pre.push(cid);
    }
    let list = await baseDao.query(sql, pre);
    if (list.length != 1) {
        throw new Error("\ncan not find config " + cid);
    }
    return list[0];
};

const getRPC = async ({pointID = ''}) =>{
    let sql = `SELECT * FROM cs_rpc where is_del = 0`;
    let pre = [];
    if (pointID !== '') {
        sql += ` AND crid = ?`;
        pre.push(pointID);
    }
    let list = await baseDaoConsole.query(sql, pre);
    if (list.length != 1) {
        throw new Error("\ncan not find config " + cid);
    }
    return list[0];
};

const rechargeAdd = async (transactions, conn) =>{
    for (let i in transactions) {
        let transaction = transactions[i];
        let sql = "insert into abc_recharge (uid, currency_id, amount," +
            " address, txHash, category, confirmations) value (?,?,?,?,?,?,?)";
        let pre = [
            transaction.uid,
            transaction.cid,
            transaction.amount,
            transaction.address,
            transaction.txHash,
            transaction.category,
            transaction.confirmations
        ];
        await baseDao.execute({conn, sql, pre});
    }
};
const getRechargeTx = async (cid) =>{
    let sql = "select txHashs from abc_recharge_tx where cid = ? and is_del = 0";
    let pre = [cid];
    let list = await baseDao.query(sql, pre);
    if (list.length > 0) {
        return JSON.parse(list[0].txHashs);
    } else {
        return [];
    }
};
const getUid = async(address) =>{
    let sql = "select * from abc_user_address where address = ?";
    let pre = [address];
    let res = await baseDao.query(sql, pre);
    if (res.length == 0) {
        return 0;
    } else {
        return res[0].uid
    }
};

const rechargeConfigUpdate= async(cid, blockNum, conn) =>{
    let sql = "update abc_recharge_config set block_num = ? where currency_id = ?";
    let pre = [blockNum, cid];
    return await baseDao.execute({conn, sql, pre});
};

const getRechargeConfig = async(cid, end) => {
    let sql = "select * from abc_recharge_config where currency_id = ?";
    let pre = [cid];
    let res = await baseDao.query(sql, pre);
    if (res.length == 0) {
        await baseDao.query("insert into abc_recharge_config" +
            "(currency_id, block_num) values (?,?)", [cid, end]);
        return end;
    } else {
        return res[0].block_num;
    }
};

const getUserAddress = async(crid) =>{
    let sql = "select address from currency_user_address where currency_id = ? and is_del = 0";
    let pre = [crid];
    let res = await baseDao.query(sql, pre);
    let addressList = [];
    for (let i in res) {
        addressList.push(res[i].address);
    }
    return addressList;
};
const getRechargeList = async(status = '', cid, is_clt = '') =>{
    let sql = "select * from abc_recharge where " +
        "currency_id = ? and category = 'receive'";
    let pre = [cid];
    if (is_clt !== '') {
        sql += " and is_clt = ?";
        pre.push(is_clt);
    }
    if (status !== '') {
        sql += " and status = ?";
        pre.push(status);
    }
    return await baseDao.query(sql, pre);
};

const collectionAdd = async(collections, conn) =>{
    for (let i in collections) {
        let collection = collections[i];
        let sql = "INSERT INTO `abc_collection` (`rcg_id`, `cid`," +
            "`amount`, `uid`, `from`, `to`, `txHash`) VALUES (?,?,?,?,?,?,?)";
        let pre = [collection.rcg_id, collection.cid, collection.amount, collection.uid, collection.from, collection.to, collection.txHash];
        console.log("here1");
        await baseDao.execute({conn, sql, pre});
    }
};

const rechargeCltUpdate = async(recharges, conn)=>{
    for (let i in recharges) {
        let recharge = recharges[i];
        let sql = "update abc_recharge set is_clt = ? where id = ?";
        let pre = [recharge.is_clt, recharge.id];
        console.log("id--->",recharge.id);
        console.log("is_clt--->",recharge.is_clt);
        await baseDao.execute({conn, sql, pre});
    }
};

const getCFeeCount = async({to = '', cf_status = ''})=>{
    let sql = "select sum(amount) as cnt from " +
                "abc_collection_fee where is_del = 0";
    let pre = [];
    if (to !== "") {
        sql += " and `to` = ?";
        pre.push(to);
    }
    if (cf_status !== "") {
        sql += " and cf_status = ?";
        pre.push(cf_status);
    }

    let res = await baseDao.query(sql, pre);
    if (!res[0].cnt) {
        return 0;
    } else {
        return res[0].cnt;
    }
};

const CFeeAdd= async(cfAdds, conn) =>{
    for (let i in cfAdds) {
        let cfAdd = cfAdds[i];
        let sql = "insert into abc_collection_fee (`from`, `to`, amount, crid, txHash) values (?,?,?,?,?)";
        let pre = [cfAdd.from, cfAdd.to, cfAdd.amount, cfAdd.crid, cfAdd.txHash];
        await baseDao.execute({conn, sql, pre});
    }
};

const getRpcList = async({id = ''}) =>{
    let sql = `select * from currency where id = 0`;
    let pre = [];
    if (id !== '') {
        sql += ` AND id= ?`;
        pre.push(id);
    }
    return await baseDaoConsole.query(sql);
};

const getBlockNumber = async (params) =>{
    let end = await params.provider.getBlockNumber();
    let begin = await getRechargeConfig(params.cid, end);

    return {begin, end};
};

const getCRpc = async({crid = ''}) => {
    let sql = `SELECT * FROM cs_rpc a WHERE a.is_del = 0`;
    let pre = [];
    if (crid !== '') {
        sql += ` AND a.crid = ?`;
        pre.push(crid);
    }
    let list = await baseDao.query(sql, pre);
    if (list.length != 1) {
        throw new Error("\ncan not find config " + crid);
    }
    return list[0];
};

const getCFeeList = async({to = '', cf_status = '', crid = ''}) =>{
    let sql = "select * from abc_collection_fee where is_del = 0";
    let pre = [];
    if (to !== "") {
        sql += " and to = ?";
        pre.push(to);
    }
    if (cf_status !== "") {
        sql += " and cf_status = ?";
        pre.push(cf_status);
    }
    if (crid !== "") {
        sql += " and crid = ? order by ct_time DESC";
        pre.push(crid);
    }
    return await baseDao.query(sql, pre);
};

const getAccountList = async() =>{
    let sql = "select * from stockmarket_account where type = 6 and is_true = 0 and address != ''";
    return await baseDao.query(sql);
};

const CFeeUpdate = async (cfUpdates, conn) =>{
    for (let i in cfUpdates) {
        let cfUpdate = cfUpdates[i];
        let sql = "update abc_collection_fee set cf_status = ? where cfid = ?";
        let pre = [cfUpdate.cf_status, cfUpdate.cfid];
        await baseDao.execute({sql, pre, conn});
    }
};

const rechargeTxUpdate = async(txHashs, cid, conn)=>{
    // 先select一次
    let sql = "update abc_recharge_tx set txHashs = ? where cid = ?";
    let pre = [txHashs, cid];
    return await baseDao.execute({conn, sql, pre});
};

const InsertTx = async(txHashs, cid, conn) =>{
    let sql = "insert into abc_recharge_tx (cid, txHashs) value (?,?)";
    let pre = [
        cid,
        txHashs,
    ];
    await baseDao.execute({conn, sql, pre});
};
module.exports = {
    getCurrency, rechargeAdd,
    getRechargeTx, getUid,
    rechargeConfigUpdate,
    getRechargeConfig,getUserAddress,
    getRechargeList,collectionAdd,
    rechargeCltUpdate,getCFeeCount,
    CFeeAdd,getRpcList,getBlockNumber,
    getCRpc,getCFeeList,CFeeUpdate,
    rechargeTxUpdate,InsertTx,getRPC,getAccountList };