const ethers = require('ethers');


module.exports = {
    init() {
        return ethers;
    },

    provider(url) {
        return new ethers.providers.JsonRpcProvider(url);
    },

    parseEther(amount) {
        return ethers.utils.parseEther(amount);
    },

    formatUnits(value, decimals = 18) {
        let res = ethers.utils.formatUnits(value, decimals);
        return Number(res);
    },

    parseUnits(value, decimals) {
        return ethers.utils.parseUnits(value, decimals);
    },

    contract(abi, contractAddress, provider) {
        return new ethers.Contract(contractAddress, abi, provider);
    }
};