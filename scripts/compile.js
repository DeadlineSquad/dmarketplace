const solc = require("solc");
const path = require("path");
const fs = require("fs");

const contractName = "Marketplace";
const fileName = `${contractName}.sol`;

// Memuat kode Solidity dari file system
const contractPath = path.join(__dirname, `../contracts/${fileName}`);
const sourceCode = fs.readFileSync(contractPath, "utf8");

// Konfigurasi compiler solc
const input = {
  language: "Solidity",
  sources: {
    [fileName]: {
      content: sourceCode,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

// Mengompilasi kode Solidity menggunakan solc
const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));

// Dapatkan bytecode dari kontrak yang telah dikompilasi
const bytecode =
  compiledCode.contracts[fileName][contractName].evm.bytecode.object;

// Menulis bytecode ke file baru
const bytecodePath = path.join(
  __dirname,
  "../contracts/MarketplaceBytecode.bin"
);
fs.writeFileSync(bytecodePath, bytecode);

// Log kode kontrak yang telah dikompilasi ke konsol
console.log("Contract Bytecode:\n", bytecode);

// Dapatkan ABI dari kontrak yang telah dikompilasi
const abi = compiledCode.contracts[fileName][contractName].abi;

// Menulis ABI Kontrak ke file baru
const abiPath = path.join(__dirname, "../contracts/MarketplaceAbi.json");
fs.writeFileSync(abiPath, JSON.stringify(abi, null, "\t"));

// Log ABI Kontrak ke konsol
console.log("Contract ABI:\n", abi);
