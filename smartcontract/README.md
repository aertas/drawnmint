# Draw'n Mint Smart Contract

## Introduction

This is the smart contract for the Draw'n Mint project. The functionality of the smart contract is based on Ethereum and it has been written in Solidity programming language. The Truffle Suite has been used for the development and testing of the smart contracts.

## Prerequisites

Before proceeding with the contract, ensure that you have Node.js (https://nodejs.org/) and npm (https://www.npmjs.com/) installed on your setup.

## Frameworks

The smart contract utilizes Truffle (https://trufflesuite.com/) which is a development environment and testing framework for the Ethereum blockchain. Truffle provides a suite of tools to test and deploy your smart contracts with ease.

Ganache (https://trufflesuite.com/ganache/) is the personal blockchain for Ethereum development that you can use to deploy contracts, develop applications, and run tests. Install Ganache to streamline your smart contract testing workflows.

## Commands

Before diving into the commands that are essential for the smart contract operation, ensure you've the contract source files ready. You can do so by cloning this repository.

The following commands are available for managing the smart contracts:

### To compile the smart contract:
```bash
truffle exec abi-create.js --compile
```

This command generates the Application Binary Interface (ABI) by compiling the smart contracts.

### To test the smart contract:
```bash
truffle test
```
This command runs the tests for validating the logic of contract by simulating the calls to the contract's method.

### To reset the migrated contract:
```bash
truffle migrate --reset
```

This command helps in resetting the already deployed version of your contract during development.

### To dashboards migrate:
```bash
truffle dashboard
```

This command lets you interact with your contracts and collect real-time data, straight from a live network.

Feel free to contact me in case of any issues or for further clarifications. Enjoy drawing and minting with Draw'n Mint!