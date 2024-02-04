const fs = require('fs');

const Contract = artifacts.require("DrawnMint");
let contractInstance;
let AcOwner, AC1, AC2, AC3, AC4;

module.exports = async function (callback) {

    try {
        const accounts = await web3.eth.getAccounts()
        AcOwner = accounts[0];
        AC1 = accounts[1];
        AC2 = accounts[2];
        AC3 = accounts[3];
        AC4 = accounts[4];
        contractInstance = await Contract.deployed();

        /** SAVE ABI */
        let rawdata = fs.readFileSync('build/contracts/DrawnMint.json');
        let sc = JSON.parse(rawdata);
        let data = JSON.stringify(sc.abi);
        // To site
        fs.writeFileSync('../website/dapp/abi.json', data);
        // To Api
        fs.writeFileSync('../api/web3/abi.json', data);

        console.log("Contract Address:");
        console.log(contractInstance.address);

    } catch (error) {
        console.log(error)
    }

    callback();
}
