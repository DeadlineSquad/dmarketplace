const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  // Gunakan provider lokal (misalnya Hardhat Network atau Ganache)
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Gunakan akun dari provider
  const accounts = await provider.listAccounts();
  const seller = provider.getSigner(accounts[0]); // Akun penjual
  const buyer = provider.getSigner(accounts[1]); // Akun pembeli

  // Load ABI dan bytecode
  const abi = JSON.parse(fs.readFileSync("./build/Marketplace.abi", "utf8"));
  const bytecode = fs.readFileSync("./build/Marketplace.bin", "utf8");

  // Deploy kontrak
  console.log("Deploying contract...");
  const factory = new ethers.ContractFactory(abi, bytecode, seller);
  const marketplace = await factory.deploy();
  await marketplace.deployed();
  console.log(`Contract deployed at: ${marketplace.address}`);

  // Test 1: Register produk
  console.log("Registering product...");
  const productName = "Laptop";
  const productDescription = "High-end laptop";
  const productPrice = ethers.parseEther("0.001"); // 0.001 ETH
  const registerTx = await marketplace
    .connect(seller)
    .registerProduct(productName, productDescription, productPrice);
  await registerTx.wait();
  console.log("Product registered!");

  // Verifikasi produk terdaftar
  const productCount = await marketplace.productCount();
  const product = await marketplace.getProduct(productCount);
  console.log(`Product Details: ${JSON.stringify(product)}`);

  // Test 2: Beli produk
  console.log("Buying product...");
  const buyTx = await marketplace
    .connect(buyer)
    .purchaseProduct(productCount, { value: productPrice });
  await buyTx.wait();
  console.log("Product purchased!");

  // Verifikasi status pembelian
  const updatedProduct = await marketplace.getProduct(productCount);
  console.log(`Updated Product Details: ${JSON.stringify(updatedProduct)}`);

  // Test 3: Cek saldo penjual
  const sellerBalance = await provider.getBalance(accounts[0]);
  console.log(`Seller's balance: ${ethers.formatEther(sellerBalance)} ETH`);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
