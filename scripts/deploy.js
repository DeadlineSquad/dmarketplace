const { Web3 } = require("web3");
const path = require("path");
const fs = require("fs");

const abi = require("../contracts/MarketplaceAbi.json");
const { RPC_URL, WALLET_PRIVATE_KEY } = require("./constants");

const web3 = new Web3(RPC_URL);

const bytecodePath = path.join(
  __dirname,
  "../contracts/MarketplaceBytecode.bin"
);
const bytecode = fs.readFileSync(bytecodePath, "utf8");

const Marketplace = new web3.eth.Contract(abi);
Marketplace.handleRevert = true;

async function deploy() {
  const account = web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  console.log("Akun:", account.address);

  // get balance account
  const balance = await web3.eth.getBalance(account.address);
  console.log("Balance:", balance);

  const contractDeployer = Marketplace.deploy({
    data: "0x" + bytecode,
    arguments: [1],
  });

  const gas = await contractDeployer.estimateGas({
    from: account.address,
  });
  console.log("Estimasi gas:", gas);

  try {
    const tx = await contractDeployer.send({
      from: account.address,
      gas,
      gasPrice: 10000000000,
    });
    console.log("Contract terdeploy dengan address: " + tx.options.address);

    const deployedAddressPath = path.join(
      __dirname,
      "../contracts/MarketplaceAddress.txt"
    );
    fs.writeFileSync(deployedAddressPath, tx.options.address);
  } catch (error) {
    console.error(error);
  }
}

deploy();
