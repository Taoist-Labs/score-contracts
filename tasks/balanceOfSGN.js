require("hardhat/config");

task("balanceOfSGN", "Check balanceOf SGN")
    .addParam("accounts", "The input json file with accounts and amounts")
    .setAction(async (taskArgs, hre) => {
        const owner = await hre.ethers.getSigner(0);

        const data = require(taskArgs.accounts);
        const Score = await hre.ethers.getContractFactory("Score");
        const score = await Score.attach("0x23fda8a873e9e46dbe51c78754dddccfbc41cfe1");

        for (var i = 0; i < data.length; i++) {
            // console.log(i, data[i].account, data[i].amount);
            const num = await score.balanceOf(data[i].account);
            console.log(data[i].account, num.toString());
        }
    });