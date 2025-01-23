// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Marketplace
 * @dev Smart contract untuk marketplace terdesentralisasi berbasis Ethereum.
 */
contract Marketplace {
    // Struktur untuk menyimpan data produk
    struct Product {
        uint id;
        string name;
        string description;
        uint price; // Harga produk dalam wei
        address payable seller; // Penjual produk
        bool isSold; // Status produk (true jika terjual)
    }

    // Penyimpanan produk menggunakan mapping
    mapping(uint => Product) public products;
    uint public productCount; // Total jumlah produk yang terdaftar

    // Event untuk melacak aktivitas
    event ProductRegistered(uint id, string name, uint price, address seller);
    event ProductPurchased(uint id, address buyer);

    /**
     * @dev Fungsi untuk mendaftarkan produk baru ke marketplace.
     * @param _name Nama produk.
     * @param _description Deskripsi produk.
     * @param _price Harga produk dalam wei.
     */
    function registerProduct(string memory _name, string memory _description, uint _price) public {
        require(bytes(_name).length > 0, "Nama produk harus diisi.");
        require(bytes(_description).length > 0, "Deskripsi produk harus diisi.");
        require(_price > 0, "Harga produk harus lebih besar dari 0.");

        // Tambahkan produk ke mapping
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _description,
            _price,
            payable(msg.sender),
            false
        );

        // Emit event
        emit ProductRegistered(productCount, _name, _price, msg.sender);
    }

    /**
     * @dev Fungsi untuk membeli produk.
     * @param _id ID produk yang ingin dibeli.
     */
    function purchaseProduct(uint _id) public payable {
        // Ambil produk dari mapping
        Product memory product = products[_id];

        // Validasi produk
        require(product.id > 0 && product.id <= productCount, "Produk tidak ditemukan.");
        require(!product.isSold, "Produk sudah terjual.");
        require(msg.value == product.price, "Pembayaran harus sesuai dengan harga produk.");
        require(product.seller != msg.sender, "Penjual tidak dapat membeli produk sendiri.");

        // Transfer dana ke penjual
        product.seller.transfer(msg.value);

        // Update status produk
        product.isSold = true;
        products[_id] = product;

        // Emit event
        emit ProductPurchased(_id, msg.sender);
    }

    /**
     * @dev Fungsi untuk mendapatkan detail produk.
     * @param _id ID produk yang ingin diakses.
     * @return Semua detail produk.
     */
    function getProduct(uint _id) public view returns (
        uint, string memory, string memory, uint, address, bool
    ) {
        Product memory product = products[_id];
        return (
            product.id,
            product.name,
            product.description,
            product.price,
            product.seller,
            product.isSold
        );
    }
}