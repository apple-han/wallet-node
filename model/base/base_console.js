const mysql = require("mysql");
const {
    host,
    user,
    password,
    port,
    dbname
} = require('../../config/config').databaseConsole;

let pool = mysql.createPool({
    host,
    user,
    password,
    database:dbname,
    port
});

module.exports = {
    query: function (sql, options = []) {
        return new Promise(function (resolve, reject) {
            pool.getConnection(function (err, conn) {
                if (err) {
                    console.log("err message is--->",err);
                    reject("connect database fail");
                } else {
                    conn.query(sql, options, function (err, results, fields) {
                        //释放连接
                        conn.release();
                        //事件驱动回调
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results, fields);
                        }
                    });
                }
            });
        });
    },

    transactionStart: function () {
        return new Promise((resolve, reject) => {
            pool.getConnection((err1, conn) => {
                if (err1) {
                    reject("connect database fail");
                } else {
                    conn.beginTransaction((err2) => {
                        if (err2) {
                            reject("transaction init error");
                        }
                        resolve(conn);
                    });
                }
            });
        });
    },

    connRollback(conn) {
        return new Promise((resolve, reject) => {
            conn.rollback(() => {
                conn.release();
                resolve();
            });
        });

    },

    connCommit(conn) {
        return new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    conn.rollback(() => {
                        console.log('rollback --> ' + err.toString());
                        conn.release();
                        resolve();
                    });
                } else {
                    conn.release();
                    resolve();
                }

            });
        });
    },

    execute({conn, sql, pre}) {
        return new Promise((resolve, reject) => {
            conn.query(sql, pre, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    },

    update_sql_splice: function (sql, fields) {
        if (sql.substr(-1) === " ") {
            sql += `${fields} = ?`;
        } else {
            sql += `,${fields} = ?`;
        }
        return sql;
    },

    limit: function (sql, condition, pre) {
        if (condition.pageNo && condition.pageSize) {
            sql += ` limit ?,?`;
            pre.push((condition.pageNo - 1) * condition.pageSize)
            pre.push(parseInt(condition.pageSize))
        }

        return {
            "sql": sql,
            "pre": pre
        };
    },

    by: function (sql, by) {
        if (by.groupBy !== undefined) {
            sql += ` group by ${by.groupBy.k}`;
        }
        if (by.orderBy !== undefined) {
            sql += ` order by ${by.orderBy.k} ${by.orderBy.v}`;
        }

        return sql
    }

};
