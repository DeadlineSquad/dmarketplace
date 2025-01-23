const { Web3 } = require("web3");
const path = require("path");
const fs = require("fs");

// Meload ABI, RPC URL, dan private key dari constants.js
const abi = require("../contracts/MarketplaceAbi.json");
const {
  RPC_URL,
  WALLET_PRIVATE_KEY,
  WALLET_PRIVATE_KEY_BUYER,
} = require("./constants");

// Inisialisasi instance Web3
const web3 = new Web3(RPC_URL);

// Meload contract address dari file system
const deployedAddressPath = path.join(
  __dirname,
  "../contracts/MarketplaceAddress.txt"
);
const deployedAddress = fs.readFileSync(deployedAddressPath, "utf8").trim();

// Membuat instance contract
const Marketplace = new web3.eth.Contract(abi, deployedAddress);
Marketplace.handleRevert = true;

// Fungsi untuk interact
async function interact() {
  // Meload akun dengan private key
  const account = web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;
  const accountPembeli = web3.eth.accounts.privateKeyToAccount(
    WALLET_PRIVATE_KEY_BUYER
  );
  web3.eth.accounts.wallet.add(accountPembeli);

  console.log("Akun:", account.address);
  console.log("Akun pembeli:", accountPembeli.address);

  try {
    // Contoh 1: Mendaftarkan sebuah produk
    // console.log("Memdaftarkan produk baru...");
    // const registerReceipt = await Marketplace.methods
    //   .registerProduct(
    //     "Laptop 1",
    //     "High-end laptop 1",
    //     web3.utils.toWei("0.00001", "ether")
    //   )
    //   .send({
    //     from: account.address,
    //     gas: 3000000,
    //     gasPrice: await web3.eth.getGasPrice(),
    //   });
    // console.log(
    //   "Produk berhasil didaftarkan. Transaction hash:",
    //   registerReceipt.transactionHash
    // );

    // Contoh 2: Memuat detail produk
    const PRODUCT_ID = await Marketplace.methods.productCount().call();
    console.log("Memuat detail produk dengan ID:", PRODUCT_ID);
    const produk = await Marketplace.methods.getProduct(PRODUCT_ID).call();
    console.log("Detail produk:", produk);

    // Negative case: Mencoba membeli produk sendiri
    // // Contoh 3: Membeli produk
    // console.log("Membeli produk...");
    // const purchaseReceipt = await Marketplace.methods.purchaseProduct(1).send({
    //   from: account.address,
    //   value: produk[3], // Harga produk dalam satuan wei
    //   gas: 3000000,
    //   gasPrice: await web3.eth.getGasPrice(),
    // });
    // console.log(
    //   "Produk terbeli. Transaction hash:",
    //   purchaseReceipt.transactionHash
    // );

    // Positife case: Mencoba membeli produk dengan akun lain
    // Contoh 3: Membeli produk
    console.log("Membeli produk...");
    const purchaseReceipt = await Marketplace.methods
      .purchaseProduct(PRODUCT_ID)
      .send({
        from: accountPembeli.address,
        value: web3.utils.toWei(produk[3].toString(), "wei"), // Harga produk dalam satuan wei
        gas: 3000000,
        gasPrice: await web3.eth.getGasPrice(),
        // gasPrice: (await web3.eth.getGasPrice()) * BigInt(2), // increase gas price by 2x
      });
    console.log(
      "Produk terbeli. Transaction hash:",
      purchaseReceipt.transactionHash
    );

    // Contoh 4: Memuat detail produk setelah pembelian
    console.log("Memuat detail produk setelah pembelian...");
    const updatedProduct = await Marketplace.methods
      .getProduct(PRODUCT_ID)
      .call();
    console.log("Memuat detail produk setelah pembelian:", updatedProduct);
  } catch (error) {
    console.error(
      "Error terjadi ketika ingin interaksi dengan smart contract:",
      error
    );
  }
}

interact();
