require("hardhat/config");

task("alex", "Airdrop to alex")
    .addParam("contract", "The `Score` contract address")
    .setAction(async (taskArgs, hre) => {
        const owner = await hre.ethers.getSigner(0);
        const Score = await hre.ethers.getContractFactory("Score");
        const score = await Score.attach(taskArgs.contract);
        let amount = ethers.utils.parseEther("562513");
        amount = amount.sub(ethers.BigNumber.from(3));
        console.log(amount);
        let feeData = await ethers.provider.getFeeData();
        const response = await score.connect(owner).mint('alex🐋.eth', amount, {
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        });
        console.log("send tx, waiting for confirmations...");
        const receipt = await response.wait();
        console.log(receipt.transactionHash);
    });