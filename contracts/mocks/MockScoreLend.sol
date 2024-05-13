// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MockScoreLend is Initializable {
    address public score;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _score) public initializer {
        score = _score;
    }

    function lend() external {
        IERC20Upgradeable(score).transferFrom(msg.sender, address(this), 1*10**18);
    }

    function repay() external {
        IERC20Upgradeable(score).transfer(msg.sender, 1*10**18);
    }
}
