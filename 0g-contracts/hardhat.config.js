require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config();
require("hardhat-deploy");

/**
 */

const RPC_URL = process.env.RPC_URL;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    newton: {
      chainId: 16600,
      url: RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
};
