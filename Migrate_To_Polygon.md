## 迁移到 polygon

1. 部署 ScoreV4 合约:

```bash
npx hardhat run --network polygon scripts/deployV4.js
```

2. 获取所有 SCR 持有者的余额:

```bash
npx hardhat allBalance --network mainnet --contract 0xc74DEE15a4700D5df797bDD3982EE649A3Bb8c6C
```

结果会输出到 `scripts/4_allBalance.output.json` 文件中。

3. 设置预算

```bash
npx hardhat setBudget \
    --budget <Budget-Amount> \
    --contract <ScoreV4-Address> \
    --network polygon
```

* `<Budget-Amount>`: SCR 预算数量，例如：`48221736.0648368`
* `<ScoreV4-Address>`: ScoreV4 Polygon 主网合约地址

4. 执行空投:

```bash
npx hardhat airdrop \
    --input ./4_allBalance.output.json \
    --contract <ScoreV4-Address> \
    --network polygon
```

* `<ScoreV4-Address>`: ScoreV4 Polygon 主网合约地址
