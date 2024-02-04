const DrawnMint = artifacts.require("DrawnMint");

module.exports = function (deployer) {
  deployer.deploy(DrawnMint);
};
