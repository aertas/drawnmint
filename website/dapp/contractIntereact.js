import toast from 'react-hot-toast';
import {ethers} from 'ethers';

const Web3 = require('web3');
const {MerkleTree} = require("merkletreejs");
const keccak256 = require("keccak256");
import conf from "/next.config.js";
import Swal from 'sweetalert2';
import whiteListAddresses from "./whitelist.json";
const abi = require('./abi.json');

/** get SC status*/
export const getStatus = async () => {
    const provider = new Web3.providers.HttpProvider(conf.network.rpc);
    const web3 = new Web3(provider);
    const nftContract = new web3.eth.Contract(abi, conf.network.contractAddress);
    return nftContract.methods.status().call().then((result) => result.toString())
};

/** is address in WL */
export const checkWhiteList = async (address) => {
    const leaves = whiteListAddresses.map(addr => keccak256(addr)),
        merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true}),
        rootHash = merkleTree.getRoot().toString('hex'),
        buf2hex = x => '0x' + x.toString('hex'),
        leaf = keccak256(address),
        proof = merkleTree.getProof(leaf).map(x => buf2hex(x.data));
    return merkleTree.verify(proof, leaf, rootHash);
}

/** Get Proof */
export const getProof = async (address) => {
    const whiteListAddresses = require("./whitelist.json"),
        leaves = whiteListAddresses.map(addr => keccak256(addr)),
        merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true}),
        buf2hex = x => '0x' + x.toString('hex'),
        leaf = keccak256(address);
    return merkleTree.getProof(leaf).map(x => buf2hex(x.data));
}

/** is img supply */
export const getImgMintCount = async (imgId) => {
    const provider = new Web3.providers.HttpProvider(conf.network.rpc);
    const web3 = new Web3(provider);
    const nftContract = new web3.eth.Contract(abi, conf.network.contractAddress);
    return nftContract.methods.getImgMintCount(imgId).call().then((result) => Number(result))
}

/** is address minted */
export const isMinted = async (address) => {
    const connection = window.ethereum;
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const nftContract = new ethers.Contract(conf.network.contractAddress, abi, signer)
    return await nftContract.isMinted(address);
}

/** Get Total Supply */
export const getTotalSupply = async () => {
    const provider = new Web3.providers.HttpProvider(conf.network.rpc);
    const web3 = new Web3(provider);
    const nftContract = new web3.eth.Contract(abi, conf.network.contractAddress);
    return nftContract.methods.totalSup().call().then((result) => Number(result))
};

/** Get Hash */
export const getHash = async (tokenId) => {
    console.log("getHash worked!");
    const provider = new Web3.providers.HttpProvider(conf.network.rpc);
    const web3 = new Web3(provider);
    const nftContract = new web3.eth.Contract(abi, conf.network.contractAddress);
    return nftContract.methods.hashes(tokenId).call()
        .then((result) => {
            return {tokenId: tokenId, hash: result};
        })
};

/** Get Token */
export const getToken = async (hash) => {
    return await fetch(conf.network.apiUrl + "/get-token/" + hash, {
        headers: {'Content-Type': 'application/json',}
    })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.error('Error:', error);
            return false;
        });
};

/** Mint */
export const publicMint = async (imgID, hash, proof, price) => {
    //console.log(imgID, hash, proof, price);
    const connection = window.ethereum;
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const nftContract = new ethers.Contract(conf.network.contractAddress, abi, signer)
    const value = ethers.utils.parseEther(price.toString())
    // document.getElementById("mintButton").disabled = true;
    document.getElementById("mintExp").innerHTML = "Waiting";
    if (!window.ethereum.selectedAddress) {
        // document.getElementById("mintButton").disabled = false;
        // document.getElementById("mintButton").innerHTML = "Mint"
        return {
            success: false
        };
    }
    try {
        Swal.update({
            title: "WAITING FOR MAGIC 🪄",
        })
        const hashBN = Web3.utils.hexToNumberString(hash);
        const transaction = await nftContract.drawNmint(imgID, hashBN, proof, {value: value})
        await transaction.wait()
            .then(async function (receipt) {
                // document.getElementById("mintButton").innerHTML = "Mint"
                //document.getElementById("mintExp").innerHTML = "Successfully minted click and see!"
                document.getElementById("mintExp").innerHTML = "Successfully minted!"
                //document.getElementById("mintExp").href = conf.network.traceUrl + receipt.transactionHash
                Swal.update({
                    html: "<p>Successfully minted 🥳<br>╰(*°▽°*)╯</p>",
                    footer: "<a href='" + conf.network.traceUrl + receipt.transactionHash + "' target='_blank'>View Transaction</a>",
                })
                await getToken(hash)
                    .then(function (res) {
                        console.log(res);
                        Swal.update({
                            html: "<p>Successfully minted 🥳<br>╰(*°▽°*)╯</p>" +
                                "<a href='" + conf.network.currentUrl + "/nfts/" + res.hash +
                                "' class='decorated' target='_blank'>View your NFT</a>",
                        })
                    });
            });
        return true;
    } catch (error) {
        catchWalletError(error);
        // document.getElementById("mintButton").disabled = false;
        // document.getElementById("mintButton").innerHTML = "Mint"
        document.getElementById("mintExp").innerHTML = "";
        return 0;
    }
};

function catchWalletError(error) {
    let message = null;
    if (error && error.data && error.data.message) {
        message = error.data.message;
    } else if (error && error.message) {
        message = error.message;
    }

    if (message) {
        const errorList = [
            "Mint is not active",
            "Mint exceed max IMAGE tokens",
            "Mint exceed max DROP tokens",
            "ETH value sent is not correct",
            "User denied transaction signature",
        ];

        for (let i in errorList) {
            //console.log(message, errorList[i]);
            if (message.includes(errorList[i])) {
                toast.error(errorList[i]);
                break;
            }
        }
    }
}
