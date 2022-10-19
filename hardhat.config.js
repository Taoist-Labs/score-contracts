require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();
require("./tasks/setBudget");
require("./tasks/sumScores");
require("./tasks/airdrop");
require("./tasks/alex");
// const { setGlobalDispatcher, ProxyAgent } = require('undici')
// const proxyAgent = new ProxyAgent('http://127.0.0.1:7890')
// setGlobalDispatcher(proxyAgent)

// const GOERLI_URL = process.env.GOERLI_URL;

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
      url: process.env.GOERLI_URL_ALCHEMY,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.MAINNET_PRIVATE_KEY]
    },
    dashboard: {
      url: "http://127.0.0.1:24012/rpc",
      buildName: "local"
    },
    sepolia: {
      url: process.env.SEPOLIA_URL_INFURA,
      accounts: [process.env.GOERLI_PRIVATE_KEY],
    },
  },
};
