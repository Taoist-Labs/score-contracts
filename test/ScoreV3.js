const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require('ethers');
const { upgrades, ethers } = require("hardhat");
const OWNER_ROLE = utils.keccak256(utils.toUtf8Bytes("OWNER_ROLE"));
const PAUSER_ROLE = utils.keccak256(utils.toUtf8Bytes("PAUSER_ROLE"));
const BURNER_ROLE = utils.keccak256(utils.toUtf8Bytes("BURNER_ROLE"));
const MINTER_ROLE = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));
const SNAPSHOT_ROLE = utils.keccak256(utils.toUtf8Bytes("SNAPSHOT_ROLE"));
const cap = new ethers.utils.parseEther("1000000000");

describe("ScoreV3", function () {
    async function deployScoreFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner] = await ethers.getSigners();

        const Score = await ethers.getContractFactory("ScoreV3");
        const score = await upgrades.deployProxy(Score);
        // await score.deployed();

        return { score, owner };
    }

    describe("Deployment", function () {
        it("Should set the right name/symbol/decimals", async function () {
            const { score } = await loadFixture(deployScoreFixture);
            expect(await score.name()).to.equal("Score");
            expect(await score.symbol()).to.equal("SCR");
            expect(await score.decimals()).to.equal(18);
        });
        it("Should set the right roles", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            expect(await score.hasRole(ethers.constants.HashZero, owner.address)).to.equal(true);
            expect(await score.hasRole(OWNER_ROLE, owner.address)).to.equal(true);
            expect(await score.hasRole(PAUSER_ROLE, owner.address)).to.equal(true);
            expect(await score.hasRole(BURNER_ROLE, owner.address)).to.equal(true);
            expect(await score.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
            expect(await score.hasRole(SNAPSHOT_ROLE, owner.address)).to.equal(true);
        });
        it("Should set the right role admin", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            expect(await score.getRoleAdmin(PAUSER_ROLE)).to.equal(OWNER_ROLE);
            expect(await score.getRoleAdmin(BURNER_ROLE)).to.equal(OWNER_ROLE);
            expect(await score.getRoleAdmin(MINTER_ROLE)).to.equal(OWNER_ROLE);
            expect(await score.getRoleAdmin(SNAPSHOT_ROLE)).to.equal(OWNER_ROLE);
            expect(await score.getRoleAdmin(OWNER_ROLE)).to.equal(ethers.constants.HashZero);
            expect(await score.getRoleAdmin(ethers.constants.HashZero)).to.equal(ethers.constants.HashZero);
        });
        it("Should set the right cap", async function () {
            const { score } = await loadFixture(deployScoreFixture);
            expect(await score.cap()).to.equal(cap);
        });
        it("Should `paused`", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            expect(await score.paused()).to.equal(true);
            await expect(score.connect(owner).pause()).to.be.revertedWith("Pausable: paused");
        });
        it("Should have no snapshot now", async function () {
            const { score } = await loadFixture(deployScoreFixture);
            expect(await score.getCurrentSnapshotId()).to.equal(0);
        });
    });
    describe("Roles", function () {
        it("Should add roles", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const account = await ethers.getSigner(1);
            const roles = [SNAPSHOT_ROLE, MINTER_ROLE, BURNER_ROLE, PAUSER_ROLE];
            for (var i = 0; i < roles.length; i++) {
                let role = roles[i];
                expect(await score.hasRole(role, account.address)).to.equal(false);
                await score.connect(owner).grantRole(role, account.address);
                expect(await score.hasRole(role, account.address)).to.equal(true);
            }
        });
        it("Only `SNAPSHOT_ROLE` can `snapshot`", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const account = await ethers.getSigner(1);
            expect(await score.getCurrentSnapshotId()).to.equal(0);
            await expect(score.connect(account).snapshot()).to.be.reverted;
            await expect(score.connect(account).grantRole(SNAPSHOT_ROLE, account.address)).to.be.reverted;
            await score.connect(owner).grantRole(SNAPSHOT_ROLE, account.address);
            await score.connect(account).snapshot();
            expect(await score.getCurrentSnapshotId()).to.equal(1);
        });
    });
    describe("Pause", function () {
        it("Only `PAUSER_ROLE` can `pause` and `unpause`", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const account = await ethers.getSigner(1);
            await expect(score.connect(account).unpause()).to.be.reverted;
            await expect(score.connect(account).grantRole(PAUSER_ROLE, account.address)).to.be.reverted;
            await score.connect(owner).grantRole(PAUSER_ROLE, account.address);
            await expect(score.connect(account).pause()).to.be.revertedWith("Pausable: paused");
            expect(await score.paused()).to.equal(true);
            await score.connect(account).unpause();
            expect(await score.paused()).to.equal(false);
            await expect(score.connect(account).unpause()).to.be.revertedWith("Pausable: not paused");
        });
    });
    describe("Mint", function () {
        it("Owner can update budgets", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const account = await ethers.getSigner(1);
            const budget = ethers.utils.parseEther("1");
            expect(await score.budgetOf(account.address)).to.equal(0);
            await score.connect(owner).setBudget(account.address, budget);
            expect(await score.budgetOf(account.address)).to.equal(budget);
        });
        it("Guile/Project can't update anyone's budget", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const account = await ethers.getSigner(1);
            const other = await ethers.getSigner(2);
            const budget = ethers.utils.parseEther("1");
            expect(await score.budgetOf(account.address)).to.equal(0);
            await expect(score.connect(account).setBudget(account.address, budget)).to.be.reverted;
            await expect(score.connect(account).setBudget(other.address, budget)).to.be.reverted;
            await expect(score.connect(account).setBudget(owner.address, budget)).to.be.reverted;
            expect(await score.budgetOf(account.address)).to.equal(0);
        });
        it("Mint should update budget and total supply", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const member = await ethers.getSigner(2);
            const amount = ethers.utils.parseEther("1");
            expect(await score.totalSupply()).to.equal(0);
            await score.connect(owner).grantRole(MINTER_ROLE, minter.address);
            await expect(score.connect(minter).mint(member.address, amount)).to.be.revertedWith("Score: insufficient budgets");
            await score.connect(owner).setBudget(minter.address, amount);
            await score.connect(minter).mint(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(amount);
            expect(await score.totalSupply()).to.equal(amount);
        });
        it("The cap is 1000m", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const budget = cap.add(1);
            await score.connect(owner).setBudget(owner.address, budget);
            await score.connect(owner).mint(owner.address, cap.sub(1));
            let balance = await score.balanceOf(owner.address);
            await expect(score.connect(owner).mint(owner.address, 2)).to.be.revertedWith('Score: insufficient scores');
        });
    });
    describe("Snapshot", function () {
        it("Should have 1 snapshot after `snapshot`", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            expect(await score.getCurrentSnapshotId()).to.equal(0);
            await score.connect(owner).snapshot();
            expect(await score.getCurrentSnapshotId()).to.equal(1);
        });
    });
    describe("Burn", function () {
        it("Should update `totalSupply` after `burn`", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const burner = await ethers.getSigner(2);
            const amount = ethers.utils.parseEther("1");
            await score.connect(owner).grantRole(MINTER_ROLE, minter.address);
            await score.connect(owner).grantRole(BURNER_ROLE, burner.address);
            await score.connect(owner).setBudget(minter.address, amount);
            await expect(score.connect(burner).mint(burner.address, amount)).to.be.reverted;
            await score.connect(minter).mint(burner.address, amount);
            expect(await score.balanceOf(burner.address)).to.equal(amount);
            expect(await score.totalSupply()).to.equal(amount);
            await score.connect(burner).burn(amount);
            expect(await score.balanceOf(burner.address)).to.equal(0);
            expect(await score.totalSupply()).to.equal(0);
        });
        it("Only burner can `burn` tokens", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const burner = await ethers.getSigner(2);
            const member = await ethers.getSigner(3);
            const amount = ethers.utils.parseEther("1");
            const budget = amount.mul(2);
            await score.connect(owner).grantRole(MINTER_ROLE, minter.address);
            await score.connect(owner).grantRole(BURNER_ROLE, burner.address);
            await score.connect(owner).setBudget(minter.address, budget);
            await score.connect(minter).mint(burner.address, amount);
            await score.connect(minter).mint(member.address, amount);
            await expect(score.connect(member).burn(amount)).to.be.reverted; // no burner role
            await score.connect(member).approve(member.address, amount);
            await expect(score.connect(member).burnFrom(member.address, amount)).to.be.reverted; // no burner role
            await score.connect(burner).approve(member.address, amount);
            await expect(score.connect(member).burnFrom(burner.address, amount)).to.be.reverted; // no burner role
            await score.connect(burner).burn(amount.div(2));
            expect(await score.balanceOf(burner.address)).to.equal(amount.div(2));
            await score.connect(burner).approve(burner.address, amount.div(2));
            await score.connect(burner).burnFrom(burner.address, amount.div(2));
            expect(await score.balanceOf(burner.address)).to.equal(0);
            await score.connect(member).approve(burner.address, amount);
            await score.connect(burner).burnFrom(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(0);
        });
    });
    describe("Transfer", function () {
        it("Normal users can NOT transfer", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const member = await ethers.getSigner(3);
            const amount = ethers.utils.parseEther("1");
            await score.connect(owner).grantRole(MINTER_ROLE, minter.address);
            await score.connect(owner).setBudget(minter.address, amount);
            await score.connect(minter).mint(member.address, amount);

            await expect(score.connect(member).transfer(owner.address, amount)).to.be.revertedWith('Pausable: paused');
        });
        it("Minter can transfer", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const member = await ethers.getSigner(3);
            const amount = ethers.utils.parseEther("1");
            await score.connect(owner).grantRole(MINTER_ROLE, minter.address);
            await score.connect(owner).setBudget(minter.address, amount);
            await score.connect(minter).mint(minter.address, amount);

            expect(await score.balanceOf(minter.address)).to.equal(amount);
            expect(await score.balanceOf(member.address)).to.equal(0);
            await score.connect(minter).transfer(member.address, amount);
            expect(await score.balanceOf(minter.address)).to.equal(0);
            expect(await score.balanceOf(member.address)).to.equal(amount);
        });
        it("Burner can transfer", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const burner = await ethers.getSigner(1);
            const member = await ethers.getSigner(3);
            const amount = ethers.utils.parseEther("1");
            await score.connect(owner).grantRole(BURNER_ROLE, burner.address);
            await score.connect(owner).setBudget(owner.address, amount);
            await score.connect(owner).mint(burner.address, amount);

            expect(await score.balanceOf(burner.address)).to.equal(amount);
            expect(await score.balanceOf(member.address)).to.equal(0);
            await score.connect(burner).transfer(member.address, amount);
            expect(await score.balanceOf(burner.address)).to.equal(0);
            expect(await score.balanceOf(member.address)).to.equal(amount);
        });
    });
    describe("Weight", function () {
        it("Weight equals balance if no `snapshot`", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const member = await ethers.getSigner(3);
            expect(await score.getCurrentSnapshotId()).to.equal(0);
            const amount = ethers.utils.parseEther("1");
            const budget = amount.mul(4);
            await score.connect(owner).setBudget(owner.address, budget);

            expect(await score.weightOf(member.address)).to.equal(0);
            await score.connect(owner).mint(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(amount);
            expect(await score.weightOf(member.address)).to.equal(amount);
            await score.connect(owner).mint(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(amount.mul(2));
            expect(await score.weightOf(member.address)).to.equal(amount.mul(2));
        });
        it("Weight when snapshot-ed", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const member = await ethers.getSigner(3);
            expect(await score.getCurrentSnapshotId()).to.equal(0);
            await score.connect(owner).snapshot();
            expect(await score.getCurrentSnapshotId()).to.equal(1);

            const amount = ethers.utils.parseEther("1");
            const budget = amount.mul(4);
            await score.connect(owner).setBudget(owner.address, budget);

            expect(await score.weightOf(member.address)).to.equal(0);
            await score.connect(owner).mint(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(amount);
            expect(await score.weightOf(member.address)).to.equal(amount);
            await score.connect(owner).mint(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(amount.mul(2));
            expect(await score.weightOf(member.address)).to.equal(amount.mul(2));

            await score.connect(owner).snapshot();

            expect(await score.balanceOf(member.address)).to.equal(amount.mul(2));
            expect(await score.weightOf(member.address)).to.equal(amount.mul(1));
            await score.connect(owner).mint(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(amount.mul(3));
            expect(await score.weightOf(member.address)).to.equal(amount.mul(2));
            await score.connect(owner).mint(member.address, amount);
            expect(await score.balanceOf(member.address)).to.equal(amount.mul(4));
            expect(await score.weightOf(member.address)).to.equal(amount.mul(3));

            await score.connect(owner).snapshot();

            expect(await score.balanceOf(member.address)).to.equal(amount.mul(4));
            expect(await score.weightOf(member.address)).to.equal(amount.mul(3).div(2));
        });
        it("Weight in 24 seasons", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const member = await ethers.getSigner(3);
            const amount = ethers.utils.parseEther("1");
            for (var i = 0; i < 24; i++) {
                let weight = ethers.BigNumber.from(0);
                for (var j = 0; j < i; j++) {
                    weight = weight.add(amount).div(2);
                }
                expect(await score.balanceOf(member.address)).to.equal(amount.mul(i));
                expect(await score.weightOf(member.address)).to.equal(weight);

                await score.connect(owner).setBudget(owner.address, amount);
                await score.connect(owner).mint(member.address, amount);

                expect(await score.balanceOf(member.address)).to.equal(amount.mul(i + 1));
                expect(await score.weightOf(member.address)).to.equal(weight.add(amount));

                await score.connect(owner).snapshot();

                expect(await score.balanceOf(member.address)).to.equal(amount.mul(i + 1));
                expect(await score.weightOf(member.address)).to.equal(weight.add(amount).div(2));
                // console.log("weight = ", weight.add(amount).div(2));
            }
        });
    });
    describe("MultiMint", function () {
        it("Multiple Mint should update budget and total supply", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const member = await ethers.getSigner(2);
            const amount = ethers.utils.parseEther("1");
            expect(await score.totalSupply()).to.equal(0);
            await score.connect(owner).grantRole(MINTER_ROLE, minter.address);
            await expect(score.connect(minter).multiMint([member.address], [amount])).to.be.revertedWith("Score: insufficient budgets");
            await score.connect(owner).setBudget(minter.address, amount);
            await score.connect(minter).multiMint([member.address], [amount]);
            expect(await score.balanceOf(member.address)).to.equal(amount);
            expect(await score.totalSupply()).to.equal(amount);
        });
        it("The cap is 1000m", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const minter = await ethers.getSigner(1);
            const accounts = [minter.address];
            const budget = cap.add(1);
            await score.connect(owner).setBudget(owner.address, budget);
            await score.connect(owner).multiMint(accounts, [cap.sub(1)]);
            let balance = await score.balanceOf(owner.address);
            await expect(score.connect(owner).multiMint(accounts, [2])).to.be.revertedWith('Score: insufficient scores');
        });
        it("Multiple Mint should work just fine", async function () {
            const { score, owner } = await loadFixture(deployScoreFixture);
            const a1 = await ethers.getSigner(1);
            const a2 = await ethers.getSigner(2);
            const amount = ethers.utils.parseEther("1");
            expect(await score.totalSupply()).to.equal(0);
            await score.connect(owner).grantRole(MINTER_ROLE, owner.address);
            await expect(score.connect(owner).multiMint([a1.address, a2.address], [amount, amount])).to.be.revertedWith("Score: insufficient budgets");
            await score.connect(owner).setBudget(owner.address, amount.mul(2));
            await score.connect(owner).multiMint([a1.address, a2.address], [amount, amount]);
            expect(await score.balanceOf(a1.address)).to.equal(amount);
            expect(await score.balanceOf(a2.address)).to.equal(amount);
            expect(await score.totalSupply()).to.equal(amount.mul(2));
        });
    });
});