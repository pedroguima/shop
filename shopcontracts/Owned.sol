pragma solidity ^0.4.16;

contract Owned {
    
    address owner;
    
    modifier onlyByOwner {
        require (msg.sender == owner);
        _;
    }
    
    function Owned () {
        owner = msg.sender;
    }
    
}

