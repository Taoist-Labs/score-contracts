require("hardhat/config");

task("airdrop", "Airdrop to a list of accounts")
    .addParam("contract", "The `Score` contract address")
    .addParam("input", "The input json file with accounts and amounts")
    .setAction(async (taskArgs, hre) => {
        const owner = await hre.ethers.getSigner(0);

        // for (const account of accounts) {
        //     console.log(account.address);
        // }
        // console.log("taskArgs =", taskArgs);
        const data = require(taskArgs.input);
        console.log(data);
        const Score = await hre.ethers.getContractFactory("Score");
        const score = await Score.attach(taskArgs.contract);
        // let budget = ethers.utils.parseEther("0");
        for (var i = 0; i < data.length; i++) {
            let realAmount = ethers.utils.parseEther(data[i].amount);
            data[i]["realAmount"] = realAmount;
            // budget = budget.add(realAmount);
        }
        // console.log("budget = ", ethers.utils.formatEther(budget));
        // const tx = await score.connect(owner).setBudget(owner.address, budget);
        // let receipt = await tx.wait(12);
        // console.log(receipt.transactionHash);
        for (var i = 0; i < data.length; i++) {
            console.log(i, data[i].account, data[i].amount);
            let feeData = await ethers.provider.getFeeData();
            // console.log(feeData);
            const response = await score.connect(owner).mint(data[i].account, data[i].realAmount, {
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            });
            console.log("send tx, waiting for confirmations...");
            const receipt = await response.wait();
            console.log(data[i].account, data[i].amount, receipt.transactionHash);
        }
    });