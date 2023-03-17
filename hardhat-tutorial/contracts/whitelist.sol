//SPDX-License-Identifier:MIT
pragma solidity >=0.8.0;

contract whitelist {

    //Max number of whitelisted addresses
    uint8 public maxWhitelistedAddresses;

    //Mapping of addresss, if address is whitelisted , it is set to true
    mapping (address => bool) public whitelistedAddresses;

     // numAddressesWhitelisted would be used to keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    //Setting the max number of whitlisted addresses which will be entere at the time of deployment
    constructor(uint8 _maxWhitelistedAddresses){
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    /**
        addAddressToWhitelist - This function adds the address of the sender to the
        whitelist
     */
    function addAddressToWhitelist() public {
        //checking whether the address had already been whitelisted
        require(!whitelistedAddresses[msg.sender] , "Sender has already been whitelisted");
        // check if the numAddressesWhitelisted < maxWhitelistedAddresses, if not then throw an error.
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses cant be added, limit reached");
         // Add the address which called the function to the whitelistedAddress array
        whitelistedAddresses[msg.sender] = true;
        // Increase the number of whitelisted addresses
        numAddressesWhitelisted += 1;
    }




}

