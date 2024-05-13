const hre = require("hardhat");
const { upgrades } = require("hardhat");
const { MetamaskConnector } = require("@web3camp/hardhat-metamask-connector");

async function main() {
  let connector = new MetamaskConnector();
  let signer = await connector.getSigner();
  // let signer = undefined;

  const ScoreV4 = await hre.ethers.getContractFactory("ScoreV4", {signer: signer});
  const scoreV4 = await upgrades.deployProxy(ScoreV4);
  await scoreV4.deployed();

  console.log("ScoreV4 is deployed to:", scoreV4.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
