const { Web3 } = require("web3");
const { RPC_URL } = require("./constants");

const web3 = new Web3(RPC_URL);

// Menampilkan Chain ID (sepolia: 11155111)
web3.eth
  .getChainId()
  .then((result) => {
    console.log("Chain ID: " + result);
  })
  .catch((error) => {
    console.error(error);
  });
