require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/RNt836jGo8PxoOAvARalLoeLDDXMqnMf",
      accounts: [
        "015b528c5d2384a479b14b131ae4c7a29addd5a67520ea7885430eb82cb6bb51"
      ]
    }
  },
};
