const { ethers } = require("hardhat");

async function main() {
    // Get deployer account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying MyToken with account:");
    console.log(deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

    // Constructor arguments
    const recipient = deployer.address;     // initial token holder
    const initialOwner = deployer.address;  // owner for mint()

    // Get contract factory
    const MyToken = await ethers.getContractFactory("MyToken");

    // Deploy contract
    const myToken = await MyToken.deploy(
        recipient,
        initialOwner
    );

    // Wait for deployment
    await myToken.waitForDeployment();

    const address = await myToken.getAddress();
    console.log("MyToken deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
