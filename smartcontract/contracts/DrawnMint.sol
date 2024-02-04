// SPDX-License-Identifier: MIT
/*

         ▐█████▀████   ▄▄▄▀▄▄╓      ▄▄▄▄▄▄▄    ▄▄▄  ▄▄▄▄ ╓▄▄╕ ████▌ ╒▄▄▄  ┌▄▄▄
         ▐█████ █████  ████ ▐███    ███████▌   ████▐████ ███   ▀██▌ ▐█████▐███═
         ▐████▌ █████  ████████▀   █████▐███   ▐████████████   ██▀  ▐█████████
          ██████████▀  ████╜████  ┌██████████   █████ █████         ╘███▌█████
          ▀▀▀▀▀▀▀      ▀▀▀▀   ▀   ╙▀▀▀▀  ▀▀▀▀    ▀▀▀   ▀▀▀           ▀▀▀   ▀▀▀

                     ▄████▄  ╒█████  █████  ▐████  ████▌ ▐█████████
                     ██████▄┌██████  █████═ ██████▄█████ ▐█████████
                     ██████████████  █████  ████████████   ▐████▌
                     █████████▐████  █████  █████▀██████   ▐████▌
                     ████▌ ▀▀ ╘████  █████  ▐████  █████    ████▌


                                by @DevConcof

*/
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract DrawnMint is ERC721, Ownable {

    using Strings for uint256;

    bytes32 public rootHash;
    string private _baseURIextended;

    uint16 public SEASONID = 1;
    uint256 public totalSup = 0;
    uint256 public MAX_SUPPLY = 520;
    uint256 public WL_PRICE = 0.0 ether;
    uint256 public PUBLIC_PRICE = 0.12 ether;
    uint256 public MAX_MINT_PER_IMG = 10;
    uint256[] public hashes;

    // Mint List
    mapping(address => uint16) public mintList;

    // Imgids List
    mapping(uint16 => uint16) private imgList;

    // 1:notstarted, 2:mintstart, 3:finished
    uint public status = 1;

    constructor() ERC721("DrawnMint", "DrnMnt") {}

    // Mint
    function drawNmint(uint16 _imgid, uint256 _hash, bytes32[] calldata _merkleProof) external payable {
        require(status == 2, "Mint is not active");
        require(imgList[_imgid] < MAX_MINT_PER_IMG, "Mint exceed max IMAGE tokens");
        require(totalSup < MAX_SUPPLY, "Mint exceed max DROP tokens");
        require(getPrice(_merkleProof) == msg.value, "ETH value sent is not correct");
        hashes.push(_hash);
        imgList[_imgid] += 1;
        mintList[msg.sender] = SEASONID;
        _safeMint(msg.sender, totalSup);
        totalSup += 1;
    }

    // Get Price with Merkle Check
    function getPrice(bytes32[] calldata _merkleProof) public view returns (uint256){
        if (mintList[msg.sender] == SEASONID)
            return PUBLIC_PRICE;

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (MerkleProof.verify(_merkleProof, rootHash, leaf))
            return WL_PRICE;

        return PUBLIC_PRICE;
    }

    // Core
    function setBaseURI(string memory baseURI_) external onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist");
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, hashes[_tokenId].toString(), ".json")) : "";
    }

    function getImgMintCount(uint16 _imgid) public view returns (uint16) {
        return imgList[_imgid];
    }

    function isMinted(address _adrs) public view returns (bool) {
        return mintList[_adrs] == SEASONID;
    }

    function withdraw() public onlyOwner {
        payable(YOUR_ETH_ADDRESS).transfer(address(this).balance);
    }

    // Set WL Price
    function setWLprice(uint256 _WL_PRICE) public onlyOwner {
        WL_PRICE = _WL_PRICE;
    }

    // Set Public Price
    function setPublicPrice(uint256 _PUBLIC_PRICE) public onlyOwner {
        PUBLIC_PRICE = _PUBLIC_PRICE;
    }

    // Set Root Hash
    function setRootHash(bytes32 _rootHash) public onlyOwner {
        rootHash = _rootHash;
    }

    // Set Status
    function setStatus(uint _status) public onlyOwner {
        status = _status;
    }

    // Set New Season
    function setSeason(uint16 _SEASONID) public onlyOwner {
        SEASONID = _SEASONID;
    }

    // Set Max Mint Count Per Image
    function setMaxMintPerImg(uint16 _MAX_MINT_PER_IMG) public onlyOwner {
        MAX_MINT_PER_IMG = _MAX_MINT_PER_IMG;
    }

    // Set Supply
    function setSupply(uint256 _maxSupplyCheck) public onlyOwner {
        require(_maxSupplyCheck > totalSup, "Max supply must greater than total supply");
        MAX_SUPPLY = _maxSupplyCheck;
    }
}
