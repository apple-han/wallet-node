const domain =  async function (ctx, next) {
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.set("Content-Type", "application/json;charset=utf-8");
        ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT,OPTIONS");
        ctx.set("Access-Control-Allow-Headers", "content-type");
        await next();
};
module.exports = domain;