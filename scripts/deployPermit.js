const { ethers } = require("hardhat");

async function main() {
    // Get deployer account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying GaslessTransfer with account:");
    console.log(deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

    // Get contract factory
    const GaslessTransfer = await ethers.getContractFactory("GaslessTransfer");

    // Deploy contract
    const gaslessTransfer = await GaslessTransfer.deploy();

    // Wait for deployment
    await gaslessTransfer.waitForDeployment();

    const address = await gaslessTransfer.getAddress();

    console.log("GaslessTransfer deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

