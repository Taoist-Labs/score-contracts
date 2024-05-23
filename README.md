# SeeDAO Score

SeeDAO Score 是 SeeDAO 社区积分。该积分可由管理员批量发放。普通用户收到积分后不可转移。

> 于 2024/05/21 迁移至 Polygon 主网 

迁移历史-> [Migrate To Polygon](./Migrate_To_Polygon.md)

Polygon SCR 合约地址 `0xe4825a1a31a76f72befa47f7160b132aa03813e0`

## 合约接口
- [普通用户接口](./docs/common-interfaces.md)
- [管理员接口](./docs/admin-interfaces.md)

## 预算

只有有预算的公会和项目，才能成功`mint`。预算被`owner`控制。
公会和项目无法自行调整自己的预算。

## 代币不可转移

代币一经发放，普通用户无法转移，也无法销毁。

## 空投

```bash
npx hardhat airdrop \
    --input ./data/accounts.json \
    --contract 0xe4825a1a31a76f72befa47f7160b132aa03813e0 \
    --network polygon
```

## 快照

进行快照
```bash
npx hardhat snapshot \
    --contract 0xe4825a1a31a76f72befa47f7160b132aa03813e0 \
    --network polygon
```

打印当前快照ID
```bash
npx hardhat snapPrint \
    --contract 0xe4825a1a31a76f72befa47f7160b132aa03813e0 \
    --network polygon
```

---

👇以下是 Ethereum 主网历史合约地址

`0xc74DEE15a4700D5df797bDD3982EE649A3Bb8c6C`