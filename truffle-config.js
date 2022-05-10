//const path = require("path");
//
//module.exports = {
//  // See <http://truffleframework.com/docs/advanced/configuration>
//  // to customize your Truffle configuration!
//  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
//  networks: {
//
//    compilers: {
//      solc: {
//        version: '0.8.7',
//        parser: 'solcjs'
//      }
//    },
//
//    develop: {
//      port: 8545
//    },
//
//    development: {
//      host: "127.0.0.1",
//      port: 7545,
//      network_id: "*" // Match any network id
//    },
//  },
//
//};

const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey= require('./secrets.json').privateKey;

module.exports = {
  contracts_build_directory: './client/src/contracts',

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    // if migrate to huygens
    huygens: {
      provider: () => new HDWalletProvider([privateKey], `http://18.182.45.18:8765/`),
      network_id: 828,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  compilers: {
    solc: {
      version: "^0.8.7",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  }
};
