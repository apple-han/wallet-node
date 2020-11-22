const log4js = require('log4js');
let programName = "wallet";

log4js.configure({
    appenders:{
        console:{//记录器1:输出到控制台
            type : 'console',
        },
        data_file:{//：记录器3：输出到日期文件
            type: "dateFile",
            filename: __dirname + `/../logs/${programName}`,//您要写入日志文件的路径
            alwaysIncludePattern: true,//（默认为false） - 将模式包含在当前日志文件的名称以及备份中
            daysToKeep:10,//时间文件 保存多少天，距离当前天daysToKeep以前的log将被删除
            maxLogSize : 20971520,
            pattern: "-yyyy-MM-dd-hh.log",//（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            encoding : 'utf-8',//default "utf-8"，文件的编码
        }
    },
    categories: {
        default:{appenders:['data_file', 'console'], level:'info' },//默认log类型，输出到控制台 log文件 log日期文件 且登记大于info即可
        production:{appenders:['data_file'], level:'warn'},  //生产环境 log类型 只输出到按日期命名的文件，且只输出警告以上的log
        console:{appenders:['console'], level:'debug'}, //开发环境  输出到控制台
    },
});
module.exports = log4js;