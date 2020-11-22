const pm2 = require('pm2');

module.exports = {
    async connect() {
        return new Promise((resolve, reject) => {
            pm2.connect(function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            })
        })
    },
    async start(config) {
        return new Promise((resolve, reject) => {
            pm2.start(config, function (err, apps) {
                if (err) {
                    reject(err);
                } else {
                    resolve(apps);
                }
            });
        });
    },
    disconnect() {
        pm2.disconnect();
    }
};