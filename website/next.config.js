const path = require('path');

const nextConfig = {
    dropActive: true,
    networkType: 'local',
    wlPrice: 0.06,
    publicPrice: 0.12,
    startSupply: 0,
    seasonSupply: 520,
    seasonId: 2,
    mintPerImage: 13,
    mintDate: "Jan 27, 2025 05:00 PM UTC",
    networks: {
        local: {
            chainId: 0x539,
            traceUrl: "",
            blockExplorerUrl: "",
            chainName: "Localhost 8545",
            symbol: "ETH",
            rpc: "http://127.0.0.1:8545",
            contractAddress: "0x3f702F2BfFCb866b87Ab85dC2a1aBE44461c294a",
            apiUrl: "HTTP://127.0.0.1:3000",
            currentUrl: "http://localhost:8082",
            collectionOpenseaUrl: "",
            collectionEtherscanUrl: "",
            seeOnOpensea: "",
            seeOnEtherscan: ""
        },
        testnet: {
            chainId: 0x5,
            traceUrl: "https://goerli.etherscan.io/tx/",
            blockExplorerUrl: "https://goerli.etherscan.io/",
            chainName: "Goerli Test Network",
            symbol: "ETH",
            rpc: "https://goerli.infura.io/v3/xxxxxxx",
            contractAddress: "xxxxxxx",
            apiUrl: "https://xxxxxxx.com",
            currentUrl: "https://xxxxxxx.app",
            collectionOpenseaUrl: "https://xxxxxxx",
            collectionEtherscanUrl: "https://goerli.etherscan.io/address/xxxxxxx",
            seeOnOpensea: "https://testnets.opensea.io/assets/goerli/",
            seeOnEtherscan: "https://goerli.etherscan.io/nft/"
        },
        mainnet: {
            chainId: 0x1,
            traceUrl: "https://etherscan.io/tx/",
            blockExplorerUrl: "https://etherscan.io",
            chainName: "Mainnet Ethereum",
            symbol: "ETH",
            rpc: "https://mainnet.infura.io/v3/xxxxxxx",
            contractAddress: "xxxxxxx",
            apiUrl: "https://xxxxxxx.com",
            currentUrl: "https://xxxxxxx.com",
            collectionOpenseaUrl: "https://opensea.io/collection/xxxxxxx",
            collectionEtherscanUrl: "https://etherscan.io/address/xxxxxxx#code",
            seeOnOpensea: "https://opensea.io/assets/ethereum/",
            seeOnEtherscan: "https://etherscan.io/nft/"
        }
    },
    generateEtags: false,
    poweredByHeader: false,
    httpAgentOptions: {
        keepAlive: false
    },
    reactStrictMode: true,
    swcMinify: true,
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')]
    }
}

nextConfig.network = nextConfig.networks[nextConfig.networkType];

module.exports = nextConfig
