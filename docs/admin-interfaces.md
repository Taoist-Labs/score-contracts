# 管理员接口

## 管理员角色`Roles`

合约中的各角色如下
- `Owner` 超级管理员
  - `Pauser` 可以暂停和恢复
  - `Burner` 可以燃烧代币（需用户主动授权）
  - `Minter` 可以Mint代币（消耗预算）
  - `Snapshot` 可以快照

## 一、超级管理员`owner`

超级管理员具有所有权限，包括添加和删除其他超级管理员。

推荐由Gnosis Safe多签帐户控制该管理员权限。

### 1. 添加`minter`

`minter`可以在指定的额度内`mint`，所发的`token`是直接从`0`地址发给用户的。
通常公会/项目管理帐户属于这类角色。

```solidity
function grantRole(bytes32 role, address account) public;
```

### 2. 分配预算

只有超级管理员才能分配公会和项目的预算。接口如下：
```solidity
function setBudget(address spender, uint256 amount) public;
```

## 二、普通管理员`minter`

`minter`一般是公会或项目，都有属于自己的预算。只能在自己的预算范围内支配，不能超额支配。

### 发放积分

```solidity
function mint(address to, uint256 amount) public;
```

## 三、普通管理员`burner`

`burner`是为未来的兑换预留的接口，即兑换合约。兑换合约获得用户授权后，可以销毁代币，进而发放真实的正式代币给用户。

### 销毁积分

```solidity
function burnFrom(address account, uint256 amount);
```

## 四、普通管理员`pauser`

### 暂停和取消暂停

```solidity
function pause() public;
function unpause() public;
```

## 五、普通管理员`snapshot`

管理员`snapshot`可以在对代币余额进行快照，快照的编号从`0`开始。

### 快照
```solidity
function snapshot() public;
```
