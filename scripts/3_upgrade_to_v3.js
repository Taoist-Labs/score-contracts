// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    const ScoreV3 = await ethers.getContractFactory("ScoreV3");
    // when you do the upgrade, fill the proxy address here
    const instance = await upgrades.upgradeProxy('', ScoreV3);
    console.log("Score V3 upgraded");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});