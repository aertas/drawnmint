const {MerkleTree} = require("merkletreejs");
const keccak256 = require("keccak256");

const whiteListAddresses = require("./whitelist.json");

// Hash addresses to get the leaves
const leaves = whiteListAddresses.map(addr => keccak256(addr))
// Create tree
let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
// Get root
let rootHash = merkleTree.getRoot().toString('hex')
// Pretty-print tree

console.log("Root:\n")
//console.log(merkleTree.toString())
console.log("0x" + rootHash.toString())
console.log("\n")

/*
const address = "0x002B592979aBB38f2B89C53A536Cd2e9328229c9";
const leaf = keccak256(address) // address from wallet using walletconnect/metamask
const proof = tree.getProof(leaf).map(x => buf2hex(x.data))
console.log(proof);
//contract.methods.safeMint(address, proof).send({ from: address })
*/
