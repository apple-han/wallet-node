// 全局异常处理
// 500的错误的信息是不应该返回到客户端的
// 简化error, 清晰明了的信息
// HTTP Status Code 2xx
const {HttpException} = require("../core/http-exception");


const catchError = async(ctx, next) => {
    try {
        await next()
    } catch (error) {
        const isHttpException = error instanceof HttpException;
        isDev = global.config.environment == 'dev';
        if(isDev && !isHttpException){
            throw error
        }
        if(error instanceof HttpException){
            ctx.body = {
                msg: error.msg,
                error_code:error.errorCode,
                request:  `${ctx.method} ${ctx.path}`
            };
            ctx.status = error.code
        }else{
            ctx.body = {
                msg: "we make a mistake",
                error_code:999,
                request:  `${ctx.method} ${ctx.path}`
            };
            ctx.status = 500
        }
    }
};

module.exports = catchError;