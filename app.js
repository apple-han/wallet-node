const Koa = require('koa');
const parser = require("koa-bodyparser");
const InitManager = require('./core/init');
const catchError = require("./middlewares/exception");
const domain = require("./middlewares/domain");


const app = new Koa();
// 全局异常处理
app.use(catchError);
//跨域
app.use(domain);
app.use(parser());

InitManager.initCore(app);

app.listen(3000);
