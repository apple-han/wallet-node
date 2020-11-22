const list = require("../model/coin");
const {btc,usdt,erc20,eth} = require('./kind');


async function ByIDWithdraw(id){
    // 从数据库获取对应的信息
    let lists = await list({condition: {id: id}});
    // 遍历lists,
    if (lists.length != 1) {
        throw new global.errs.HttpException();
    }
    await Choice(lists)
}

async function Choice(lists){
    let data = lists[0];
    switch (data.currency_type) {
        case 0:
            await btc(data);
            break;
        case 1:
            await usdt(data);
            break;
        case 2:
            await eth(data);
            break;
        case 3:
            await erc20(data);
            break;
    }
}
module.exports = ByIDWithdraw;
