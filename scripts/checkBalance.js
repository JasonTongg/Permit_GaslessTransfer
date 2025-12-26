const { ethers } = require("hardhat");

async function main() {
    const TOKEN_ADDRESS = "0xf88b1ac1F36AF07D9eF74F3Fff2F84457b84bFe1";

    const address1 = "0xeFF3521fb13228C767Ad6Dc3b934F9eFAC9c56aD";
    const address2 = "0xD38F2E53114CB54670daB5205C012B0B511240a0";

    // ---------- ERC20 ABI ----------
    const ERC20_ABI = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
    ];

    const provider = ethers.provider;

    const token = new ethers.Contract(
        TOKEN_ADDRESS,
        ERC20_ABI,
        provider
    );

    // ---------- FETCH DATA ----------
    const [
        balance1,
        balance2,
        decimals,
        symbol,
        native1,
        native2
    ] = await Promise.all([
        token.balanceOf(address1),
        token.balanceOf(address2),
        token.decimals(),
        token.symbol(),
        provider.getBalance(address1),
        provider.getBalance(address2)
    ]);

    console.log("Token:", symbol);
    console.log("Token Contract:", TOKEN_ADDRESS);
    console.log("");

    console.log(
        `ERC20 balance of ${address1}:`,
        ethers.formatUnits(balance1, decimals),
        symbol
    );

    console.log(
        `Native balance of ${address1}:`,
        ethers.formatEther(native1),
        "ETH"
    );

    console.log("");

    console.log(
        `ERC20 balance of ${address2}:`,
        ethers.formatUnits(balance2, decimals),
        symbol
    );

    console.log(
        `Native balance of ${address2}:`,
        ethers.formatEther(native2),
        "ETH"
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
