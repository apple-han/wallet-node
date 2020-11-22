const Web3 = require("web3");
let web3, pwd;

module.exports = {
    init(url, rpcPwd) {
        web3 = new Web3(url);
        pwd = rpcPwd;
        return web3;
    },

    async myUnlockAccount({from, duration = null}) {
        return new Promise((resolve, reject) => {
            web3.eth.personal.unlockAccount(from, pwd, duration).then((isUnLock) => {
                if (isUnLock) {
                    resolve(1);
                } else {
                    console.log("error value is-->", isUnLock);
                    reject("\n" + from + "解锁失败\n");
                }
            }).catch((err) => {
                console.log("error value is-->", err);
                reject("\n" + from + "解锁失败\n");
            });
        })
    },
    async myLockAccount({from}) {
        return new Promise((resolve, reject) => {
            web3.eth.personal.lockAccount(from).then((isLock) => {
                if (isLock) {
                    resolve(1);
                } else {
                    reject("\n" + from + "加锁失败\n");
                }
            });
        })
    },
    async mySendTransaction(overrides) {
        return new Promise((resolve, reject) => {
            web3.eth.sendTransaction(overrides, function (error, hash) {
                if (!error) {
                    resolve(hash)
                } else {
                    reject(error)
                }
            })
                .on("receipt", (receipt) => {
                    console.log("receipt " + receipt)
                })
                .on('error', (error) => {
                    console.log("error " + error)
                });
        })
    },

    async call(overrides) {
        return await web3.eth.call(overrides);
    },

    async contractTransfer(web3Contract, amount, to, overrides) {
        return new Promise((resolve, reject) => {
            web3Contract.methods.transfer(
                to,
                amount,
            ).send(overrides, function (error, hash) {
                if (!error) {
                    resolve(hash);
                } else {
                    reject(error);
                }
            });
        });
    },

    async contractTransferFrom({web3Contract, amount, from, to, overrides}) {
        return new Promise((resolve, reject) => {
            web3Contract.methods.transferFrom(
                from,
                to,
                amount,
            ).send(overrides, function (error, hash) {
                if (!error) {
                    resolve(hash);
                } else {
                    reject(error);
                }
            });
        });
    },

    async contractApprove({web3Contract, amount, to, overrides}) {
        return new Promise((resolve, reject) => {
            web3Contract.methods.approve(
                to,
                amount,
            ).send(overrides, function (error, hash) {
                if (!error) {
                    resolve(hash);
                } else {
                    reject(error);
                }
            });
        });
    },

    web3Contract(abi, contractAddress) {
        return new web3.eth.Contract(abi, contractAddress);
    },

    async newAccount() {
        return await web3.eth.personal.newAccount(pwd);
    }
};