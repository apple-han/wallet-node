const addressDB = require("../../model/address/address");

async function main(params) {
    for (let i in params.rpcList) {
        let rpc = params.rpcList[i];
        let uid = await addressDB.getUid(rpc.id);
        console.log("uid--->",uid);
        let userList = await addressDB.getUserList(uid);
        console.log("userList-->",userList.length)
        for (let i in userList) {
            let uid = userList[i].uid;
            // switch (rpc.cr_type) {
            //     case 0:
            //         await addressDB.btc(uid, rpc);
            //         break;
            //     case 1:
            await Ut.sleep(2000);
            console.log("rpc--->",rpc.id);
            await addressDB.eth(uid, rpc);
            // break;
            // }
        }
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
module.exports = main;