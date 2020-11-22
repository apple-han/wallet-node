const OmniClient = require('../lib/OmniClient').OmniClient;
const dbHelper = require("../model/common/common");

// 1.usdt客户端
let omniClient;

module.exports = {
    init({host, port, user, pass}) {
        omniClient = new OmniClient({host, port, user, pass});
        return omniClient;
    },

    // 获取最新区块号
    async getBlockCount() {
        return await omniClient.getBlockCount();
    },

    // 获取指定区块的hash列表
    async omniListBlockTransactions(blockNumber) {
        return await omniClient.omniListBlockTransactions(blockNumber);
    },

    // 获取omni同步的开始和结尾
    async getStartEnd(cid) {
        let begin = await dbHelper.getRechargeConfig(cid);
        let end = await omniClient.getBlockCount();
        return {begin, end}
    },

    // 返回指定区间区块的所有hash, 不含开头含结尾(0, 10000]
    async omniListBlocksTransactions(start, end) {
        if ((start + 1) > end) return [];
        return await omniClient.omniListBlocksTransactions(start + 1, end);
    },

    // 根据交易hash返回 hash详情
    async getAllTransactions(hashs, filter = {}) {
        let transactions = [];
        for (let i in hashs) {
            let hash = hashs[i];
            let transaction = await omniClient.omniGetTransaction(hash);
            // 地址过滤
            if (filter.hasOwnProperty("addresses")) {
                if (filter.addresses.indexOf(transaction.referenceaddress) <= -1) {
                    transaction = "";
                }
            }

            if (transaction != "") {
                transactions.push(transaction);
            }
        }
        return transactions;
    },

    async omniGetTransaction(hash) {
        return await omniClient.omniGetTransaction(hash);
    },

    // 获取所有地址的指定币种的余额
    async omniGetAllBalancesForId(propertyid) {
        return await omniClient.omniGetAllBalancesForId(propertyid);
    },

    // 发送所有omni coin TODO 此方法不用
    // async omniFundedSendAll(fromAddress) {
    //     let toAddress = extractConfig.btc.collection.address;
    //     let ecosystem = extractConfig.btc.ecosystem;
    //     let feeAddress = extractConfig.btc.temp.address;
    //     return await omniClient.omniFundedSendAll(fromAddress, toAddress, ecosystem, feeAddress);
    // },

    // 从地址发送地址到omni
    async sendOmni({fromAddress, propertyid, amount}) {
        // 1.判断手续费够不够


    },


    async omniGetWalletAddressBalances() {
        return await omniClient.omniGetWalletAddressBalances();
    },

    // 获取btc交易hash
    async getBlockHash(blockNumber) {
        return await omniClient.getBlockHash(blockNumber);
    },

    async getBlock(hash) {
        return await omniClient.getBlock(hash);
    },

    async getTransaction(hash) {
        return await omniClient.getTransaction(hash);
    },

    async getNewAddress(account = "recharge") {
        return await omniClient.getNewAddress(account);
    }
};

