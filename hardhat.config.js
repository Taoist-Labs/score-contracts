require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();
const { setGlobalDispatcher, ProxyAgent } = require('undici')
const proxyAgent = new ProxyAgent('http://127.0.0.1:7890')
setGlobalDispatcher(proxyAgent)

const GOERLI_URL = process.env.GOERLI_URL;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  etherscan: {
    apiKey: "SA6N56NGAPFWI99RM3GWDVX2IGENF5EUH6",
  },
  networks: {
    goerli: {
      url: GOERLI_URL,
      accounts: [GOERLI_PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.MAINNET_PRIVATE_KEY]
    },
    dashboard: {
      url: "http://127.0.0.1:24012/rpc",
      buildName: "local"
    },
  },
};

task("airdrop", "Airdrop to a list of accounts")
  .addParam("contract", "The `Score` contract address")
  .addParam("input", "The input json file with accounts and amounts")
  .setAction(async (taskArgs, hre) => {
    const owner = await hre.ethers.getSigner(0);

    // for (const account of accounts) {
    //     console.log(account.address);
    // }
    console.log("taskArgs =", taskArgs);
    const data = require(taskArgs.input);
    // const data = require("./data/a1.json");
    console.log(data);
    const Score = await hre.ethers.getContractFactory("Score");
    const score = await Score.attach(taskArgs.contract);
    let budget = 0;
    for (var i = 0; i < data.length; i++) {
      budget += data[i].amount;
    }
    console.log("budget = ", budget);
    const tx = await score.connect(owner).setBudget(owner.address, budget);
    let receipt = await tx.wait(15);
    console.log(receipt.transactionHash);
    for (var i = 0; i < data.length; i++) {
      console.log(data[i].account, data[i].amount);
      const response = await score.connect(owner).mint(data[i].account, data[i].amount);
      const receipt = await response.wait(15);
      console.log(data[i].account, data[i].amount, receipt.transactionHash);
    }
  });