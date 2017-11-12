pragma solidity ^0.4.16;

import "./owned.sol";

contract Shop is Owned {
    
    struct product {
        string description;
        uint price; // in wei
        uint stock;
    }
    
    mapping (uint => product) products;
    uint public numProducts;
    
    modifier validID (uint _id) {
        require (_id < numProducts);
        _;
    }
    
    function Shop() {
    }
    
    function addProduct(string _description, uint _price, uint _stock) public returns (bool) {
        product memory p;
        p.description = _description;
        p.price = _price;
        p.stock = _stock;
        
        products[numProducts] = p;
        numProducts++;
        return true;
    }
    
    function getShopBalance() public constant returns (uint) {
        return(this.balance);
    }
    
    function getProduct(uint _id) public constant validID(_id) returns (string, uint, uint) {
        product memory p = products[_id];
        return(p.description, p.price, p.stock);
    }
    
    function buyProduct(uint _id, uint _quantity) public payable validID(_id) returns (bool) {
        product memory p = products[_id];
        require (_quantity >=1 && p.stock >=_quantity);
        require (msg.value == p.price*_quantity);        
        
        products[_id].stock -= _quantity;
        return true;
    }
    
    function withdraw() public onlyByOwner returns (bool) {
        owner.transfer(this.balance);
        return true;
    }
    
}
