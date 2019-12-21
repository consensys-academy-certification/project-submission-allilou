// ===== DO NOT MODIFY THIS FILE =====

module.exports = { 
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "^0.5.0", // A version or constraint - Ex. "^0.5.0"
                         // Can also be set to "native" to use a native solc
      }
    }
}