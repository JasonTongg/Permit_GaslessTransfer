const { ethers } = require("hardhat");

async function main() {
    // ---------- CONFIG ----------
    const TOKEN_ADDRESS = "0xf88b1ac1F36AF07D9eF74F3Fff2F84457b84bFe1";
    const GASLESS_TRANSFER_ADDRESS = "0xf69e3A539bD7c5c9737917328cBe24Cc7a547895";

    const senderPrivateKey =
        "0x27a529bad9848d28dde6e49089e410cb34470ac0071fbb4faf3dee5b5119aab6"; // user
    const receiverAddress = "0xD38F2E53114CB54670daB5205C012B0B511240a0";

    const amount = ethers.parseUnits("100000000000", 18);
    const fee = ethers.parseUnits("0.1", 18);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    // ---------- PROVIDER ----------
    const provider = ethers.provider;

    // ---------- RELAYER ----------
    const [relayer] = await ethers.getSigners();

    // ---------- USER WALLET (OFF-CHAIN SIGNER) ----------
    const sender = new ethers.Wallet(senderPrivateKey, provider);

    // ---------- TOKEN CONTRACT (MINIMAL ABI – FIX) ----------
    const ERC20_PERMIT_ABI = [
        "function name() view returns (string)",
        "function nonces(address) view returns (uint256)",
        "function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)"
    ];

    const token = new ethers.Contract(
        TOKEN_ADDRESS,
        ERC20_PERMIT_ABI,
        provider
    );

    // ---------- FETCH PERMIT DATA ----------
    const nonce = await token.nonces(sender.address);
    const name = await token.name();
    const version = "1"; // OpenZeppelin ERC20Permit default
    const chainId = (await provider.getNetwork()).chainId;

    // ---------- EIP-712 DOMAIN ----------
    const domain = {
        name,
        version,
        chainId,
        verifyingContract: TOKEN_ADDRESS,
    };

    // ---------- PERMIT STRUCT ----------
    const types = {
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
    };

    const values = {
        owner: sender.address,
        spender: GASLESS_TRANSFER_ADDRESS,
        value: amount + fee,
        nonce,
        deadline,
    };

    // ---------- SIGN PERMIT ----------
    const signature = await sender.signTypedData(domain, types, values);
    const { v, r, s } = ethers.Signature.from(signature);

    // ---------- GASLESS CONTRACT ----------
    const gasless = await ethers.getContractAt(
        "GaslessTransfer",
        GASLESS_TRANSFER_ADDRESS,
        relayer
    );

    // ---------- EXECUTE ----------
    const tx = await gasless.sendWithPermit(
        TOKEN_ADDRESS,
        sender.address,
        receiverAddress,
        amount,
        fee,
        deadline,
        v,
        r,
        s
    );

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Gasless transfer executed");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
