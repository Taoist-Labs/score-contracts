const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const ScoreV4 = await hre.ethers.getContractFactory("ScoreV4");
  const scoreV4 = await upgrades.deployProxy(ScoreV4);
  await scoreV4.deployed();

  console.log("ScoreV4 is deployed to:", scoreV4.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
