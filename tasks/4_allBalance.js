require("hardhat/config");

task("allBalance", "Summary all balances")
    .addParam("contract", "The `Score` contract address")
    .setAction(async (taskArgs, hre) => {
        const Score = await hre.ethers.getContractFactory("ScoreV3");
        const score = await Score.attach(taskArgs.contract);

        const balances = new Map();

        const events = await score.queryFilter("Transfer")
        for (let i = 0; i < events.length; i++) {
            const from = events[i].args["from"];
            const to = events[i].args["to"];
            // const value = hre.ethers.utils.formatEther(events[0].args["value"]); // 8000.0
            const value = events[i].args["value"]; // `BigNumber` type

            console.log(`地址 ${from} 转账 '${value.toString()}' SCR 到地址 ${to}`)

            if (to !== "0x0000000000000000000000000000000000000000") {
                if (balances[to] === undefined) {
                    balances[to] = value;
                } else {
                    balances[to] = balances[to].add(value);
                }
            }
            if (from !== "0x0000000000000000000000000000000000000000") {
                if (balances[from] === undefined) {
                    throw new Error("'from' should exist in 'balances'");
                } else {
                    balances[from] = balances[from].sub(value);
                }
            }
        }

        writeToFile(hre.ethers.utils.formatEther, balances);
    });

function writeToFile(formatEther, balances) {
    const balanceArr = [];
    for (const [key, value] of Object.entries(balances)) {
        balanceArr.push({ account: key, amount: formatEther(value) });
    }

    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(__dirname, '4_allBalance.output.json');
    fs.writeFileSync(filePath, JSON.stringify(balanceArr, null, 2));
    console.log(`Balances are written to ${filePath}`);
}

// execute command: `$ npx hardhat allBalance --network mainnet --contract 0xc74DEE15a4700D5df797bDD3982EE649A3Bb8c6C`
