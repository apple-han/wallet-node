var NodeRSA = require('node-rsa');
const fs = require("fs");
let pubKeyTxt = fs.readFileSync('./common/file/public.txt', 'utf8');
let priKeyTxt = fs.readFileSync('./common/file/private.txt', 'utf8');
let pubKey = new NodeRSA(pubKeyTxt, 'pkcs8-public');//导入公钥
let priKey = new NodeRSA(priKeyTxt, 'pkcs8-private');//导入私钥

module.exports = {
    async encrypt(content) {
        let buffer = new Buffer(content);
        return pubKey.encrypt(buffer, "base64");
    },

    async decrypt(content) {
        let buffer = new Buffer(content, "base64");
        let decrypted = priKey.decrypt(buffer, "base64");
        let res = new Buffer(decrypted, "base64");
        return res.toString();
    }
};