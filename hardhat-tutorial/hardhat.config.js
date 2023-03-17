require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",

  //Add the below dependency to connect the Alchemy adn use a network and the wallet
  networks:{
    goerli: {
      url:process.env.ALCHEMY_HTTP_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }

};
