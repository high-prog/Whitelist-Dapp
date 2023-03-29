import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import web3Modal from 'web3modal'
import { providers, Contract } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../../constants/index";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // Number of people already joined the whitelist
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
   // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
  const [ joinedWhitelist, setJoinedWhitelist] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);


   /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

  const getProviderOrSigner = async (needSigner = false) => {
    try{
      // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
      const provider = await web3ModalRef.current.connect();
      const web3Provider =  new providers.Web3Provider(provider)

      // If user is not connected to the Goerli network, let them know and throw an error
      const {chainId} = await web3Provider.getNetwork();
      if(chainId !== 5){
        window.alert("Change the network to Goerli");
        throw new Error("Change network to Goerli");
      }

      if (needSigner) {
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider;

    }catch(err){

    }
  }

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async () => {
      try{
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      console.log("got here")
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);


      }catch(err){
        console.log(err);
      }
  }

  const getNumberOfWhitelisted = async () => {
    try{
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider,
      )

       // call the numAddressesWhitelisted from the contract
       const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
       setNumOfWhitelisted(_numberOfWhitelisted);

    }catch(err){
      console.log(err);
    }
  }




  const connectWallet = async () => {
    try{

      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    }catch(err){
      console.error(err);
    }
  }

  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      })
    }
    connectWallet();

  }, [walletConnected])


  const addAddressToWhitelist = async () => {
    try{
        // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToWhitelist from the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    }catch(err){
      console.log(err);
    }
  }


  
  const renderButton = () => {
    if(walletConnected){
      if(joinedWhitelist){
        return(
          <div>
            Thanks for joining the whitelist!
          </div>
        )
      }else if(loading){
        return (
          <button className={styles.button}>
            Loading...
          </button>
        )
      }
      
      else{
        return (
          <button className={styles.button} onClick={addAddressToWhitelist}>
            Join the Whitelist
          </button>
        )
      }
    }else{
      <button className={styles.button} onClick={connectWallet}>
            Connect Wallet
          </button>
    }
  }

  return (
    <div>
      <Head>
        <title>Whitelist dApp</title>
        <meta name="description" content="Whitelist-dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numOfWhitelisted} have already joined the Whitelist.
          </div>
          {renderButton()}
          <div>
            <img className={styles.image} src="./crypto-devs.svg" alt="" />
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
      Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
