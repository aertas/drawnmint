module.exports = {
  dashboard: {
    port: 24012
  },
  api_keys: {
    etherscan: '7VET9DUHRPXMRGNAIZAESEAQRGHY8PVNHE'
  },
  plugins: ['truffle-plugin-verify'],
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*"       // Any network (default: none)
    }
    /*
          develop: {
              port: 8545,
              network_id: 5777,
              accounts: 5,
              defaultEtherBalance: 500,
              blockTime: 3
          }
    */
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17"      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
};
