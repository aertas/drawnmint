const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")

const Contract = artifacts.require("DrawnMint");
let contractInstance,
    rootHash;
let testHash;
let curSup = 0;

let WL_PRICE = web3.utils.toBN(web3.utils.toWei("0.06", 'ether'));
let PUBLIC_PRICE = web3.utils.toBN(web3.utils.toWei("0.12", 'ether'));
let SEASONID = 1;

contract("DrawnMint", async (accounts) => {
    const AcOwner = accounts[0],
        AC1 = accounts[1], // IN WL
        AC2 = accounts[2], // IN WL
        AC3 = accounts[3], // NOT IN WL
        AC4 = accounts[4] // IN WL
    ;
    const WL = [
        AC1, AC2, AC4
    ];

    it("start", async () => {
        contractInstance = await Contract.deployed();
        await contractInstance.setWLprice(WL_PRICE, {from: AcOwner});
        await contractInstance.setPublicPrice(PUBLIC_PRICE, {from: AcOwner});
        rootHash = createRoot(WL);
        await contractInstance.setRootHash(rootHash, {from: AcOwner});
        const value = await contractInstance.rootHash();
        assert.equal(value, "0x" + rootHash.toString('hex'), "Root Hash Error");
    });


    it("Status Check", async () => {
        const value = await contractInstance.status();
        assert.equal(value, 1, "Status should be 1 (notstarted)");
    });

    it("Start Sale", async () => {
        // 1:notstarted, 2:mintstart, 3:finished
        await contractInstance.setStatus(2, {from: AcOwner});
        const value = await contractInstance.status();
        assert.equal(value, 2, "Status should be 2 (mintstart)");
    });

    it("Mint WL", async () => {
        let hash = genRandomHash();
        let proof = getProof(WL, AC1);

        /** Mint list control */
        let checkIsMinted = (
            await contractInstance.isMinted.call(AC1)
        );
        assert.equal(checkIsMinted, false, "hadn't minted before");

        /** Mint */
        await contractInstance.drawNmint(1, hash, proof, {from: AC1, value: WL_PRICE});
        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();
        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");

        const checkHash = (
            await contractInstance.hashes(0)
        ).toNumber();
        assert.equal(checkHash, hash, "Hash error");

        /** Mint list control */
        checkIsMinted = (
            await contractInstance.isMinted.call(AC1)
        );
        assert.equal(checkIsMinted, true, "minted before");
    });

    it("Img Mint Count Change", async () => {
        await contractInstance.setMaxMintPerImg(18, {from: AcOwner});
        const value = await contractInstance.MAX_MINT_PER_IMG();
        assert.equal(value, 18, "MAX_MINT_PER_IMG should be 18");
    });

    it("Img Mint Check", async () => {
        const imgMintCount = (
            await contractInstance.getImgMintCount(1)
        ).toNumber();
        assert.equal(imgMintCount, 1, "img mint count not correct");
    });

    it("Mint Public 1", async () => {
        let proof = getProof(WL, AC1);
        let hash = genRandomHash();

        await contractInstance.drawNmint(1, hash, proof, {from: AC1, value: PUBLIC_PRICE})

        const imgMintCount = (
            await contractInstance.getImgMintCount(1)
        ).toNumber();
        assert.equal(imgMintCount, 2, "img mint count not correct");

        const checkHash = (
            await contractInstance.hashes(1)
        ).toNumber();
        assert.equal(checkHash, hash, "Hash error");


        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();
        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");
    });

    it("Mint WL 2", async () => {
        let proof = getProof(WL, AC2);
        let hash = genRandomHash();

        await contractInstance.drawNmint(1, hash, proof, {from: AC2, value: WL_PRICE})

        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();

        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");
    });

    it("Mint Public 3", async () => {
        let proof = getProof(WL, AC3);
        let hash = genRandomHash();

        testHash = hash

        await contractInstance.drawNmint(1, hash, proof, {from: AC3, value: PUBLIC_PRICE})

        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();

        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");
    });

    it("Close Sale", async () => {
        // 1:notstarted, 2:mintstart, 3:finished
        await contractInstance.setStatus(3, {from: AcOwner});
        const value = await contractInstance.status();
        assert.equal(value, 3, "Status should be 3 (finished)");
    });

    it("Change MAX_SUPPLY", async () => {
        await contractInstance.setSupply(100, {from: AcOwner});
        const value = await contractInstance.MAX_SUPPLY();
        assert.equal(value, 100, "MAX_SUPPLY should be 100");
    });

    it("Change WL_PRICE", async () => {
        WL_PRICE = web3.utils.toBN(web3.utils.toWei("0.03", 'ether'));
        await contractInstance.setWLprice(WL_PRICE, {from: AcOwner});
        const value = web3.utils.fromWei(await contractInstance.WL_PRICE(), 'ether');
        assert.equal(value, 0.03, "WL_PRICE should be 0.03");
    });

    it("Change PUBLIC_PRICE", async () => {
        PUBLIC_PRICE = web3.utils.toBN(web3.utils.toWei("0.05", 'ether'));
        await contractInstance.setPublicPrice(PUBLIC_PRICE, {from: AcOwner});
        const value = web3.utils.fromWei(await contractInstance.PUBLIC_PRICE(), 'ether');
        assert.equal(value, 0.05, "PUBLIC_PRICE should be 0.05");
    });

    it("Change to Season 2", async () => {
        SEASONID = 2;
        await contractInstance.setSeason(SEASONID, {from: AcOwner});
        const value = await contractInstance.SEASONID();
        assert.equal(value, SEASONID, "SEASONID should be " + SEASONID);
    });

    it("Start Sale (Season 2)", async () => {
        // 1:notstarted, 2:mintstart, 3:finished
        await contractInstance.setStatus(2, {from: AcOwner});
        const value = await contractInstance.status();
        assert.equal(value, 2, "Status should be 2 (mintstart)");
    });

    it("Mint WL (Season 2)", async () => {
        let hash = genRandomHash();
        let proof = getProof(WL, AC1);

        /** Mint list control */
        let checkIsMinted = (
            await contractInstance.isMinted.call(AC1)
        );
        assert.equal(checkIsMinted, false, "hadn't minted before");

        /** Mint */
        await contractInstance.drawNmint(1, hash, proof, {from: AC1, value: WL_PRICE});
        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();
        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");

        /** Mint list control */
        checkIsMinted = (
            await contractInstance.isMinted.call(AC1)
        );
        assert.equal(checkIsMinted, true, "minted before");
    });

    it("Mint Public 1 (Season 2)", async () => {
        let proof = getProof(WL, AC1);
        let hash = genRandomHash();

        //let val = await contractInstance.drawNmint(1,hash, proof, {from: AC1, value: PUBLIC_PRICE})

        await contractInstance.drawNmint(1, hash, proof, {from: AC1, value: PUBLIC_PRICE})

        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();

        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");
    });

    it("Mint WL 2 (Season 2)", async () => {
        let proof = getProof(WL, AC2);
        let hash = genRandomHash();

        //let val = await contractInstance.drawNmint(1,hash, proof, {from: AC1, value: PUBLIC_PRICE})

        await contractInstance.drawNmint(1, hash, proof, {from: AC2, value: WL_PRICE})

        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();

        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");
    });

    it("Mint Public 3 (Season 2)", async () => {
        let proof = getProof(WL, AC3);
        let hash = genRandomHash();

        //let val = await contractInstance.drawNmint(1,hash, proof, {from: AC1, value: PUBLIC_PRICE})

        await contractInstance.drawNmint(1, hash, proof, {from: AC3, value: PUBLIC_PRICE})

        const totalSupply = (
            await contractInstance.totalSup()
        ).toNumber();

        curSup++;
        assert.equal(totalSupply, curSup, "TS must equal to total mint");
    });

    it("Close Sale (Season 2)", async () => {
        // 1:notstarted, 2:mintstart, 3:finished
        await contractInstance.setStatus(3, {from: AcOwner});
        const value = await contractInstance.status();
        assert.equal(value, 3, "Status should be 3 (finished)");
    });

    it("Withdraw", async () => {
        await contractInstance.withdraw({from: AcOwner});
        assert.equal(3, 3, "OK");
    });

    it("Token Check", async () => {
        const checkHash = (
            await contractInstance.hashes(3)
        ).toNumber();
        assert.equal(checkHash, testHash, "Hash error");
    });

});


function createRoot(addresses) {
    // Hash addresses to get the leaves
    let leaves = addresses.map(addr => keccak256(addr))
    // Create tree
    let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
    // Get root
    return merkleTree.getRoot();//.toString('hex')
}

function getProof(addresses, address) {
    // Hash addresses to get the leaves
    let leaves = addresses.map(addr => keccak256(addr))
    // Create tree
    let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})

    // Get proof
    let hashedAddress = keccak256(address)
    return merkleTree.getHexProof(hashedAddress);
}

function genRandomHash() {
    // let hash = "0x";
    // for (let i = 0; i < 64; i++) {
    //     hash += Math.floor(Math.random() * 16).toString(16);
    // }
    // return hash;
    return 2586420 + Math.floor(Math.random() * 1000000);
}

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}
