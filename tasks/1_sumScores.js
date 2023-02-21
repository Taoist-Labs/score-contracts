require("hardhat/config");

task("sumScores", "Sum all scores")
    .addParam("input", "The input json file with accounts and amounts")
    .setAction(async (taskArgs, hre) => {
        const owner = await hre.ethers.getSigner(0);

        const data = require(taskArgs.input);
        console.log(data);
        let budget = ethers.utils.parseEther("0");
        for (var i = 0; i < data.length; i++) {
            let realAmount = ethers.utils.parseEther(data[i].amount);
            data[i]["realAmount"] = realAmount;
            budget = budget.add(realAmount);
        }
        console.log("All scores = ", ethers.utils.formatEther(budget));
    });