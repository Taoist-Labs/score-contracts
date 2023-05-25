// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    const ScoreV2 = await ethers.getContractFactory("ScoreV2");
    // first param is proxy address
    const instance = await upgrades.upgradeProxy('', ScoreV2);
    console.log("Score V2 upgraded");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});