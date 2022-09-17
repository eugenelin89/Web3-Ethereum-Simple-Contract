const networkConfig = {
    4: {
        name: "rinkeby",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e", //https://docs.chain.link/docs/ethereum-addresses/
    },
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMAL = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMAL,
    INITIAL_ANSWER,
}
