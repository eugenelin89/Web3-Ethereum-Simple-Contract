const { network } = require("hardhat")
const { verify } = require("../utils/verify")

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
// equvalent to:
// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig

// function deployFunc(hre) {
//     console.log("Hi")
// }
// equivalent to:
// module.exports.default = deployFunc
// hre = hardhat runtime env
// module.exports = async (hre) => {
//     // pulled them out so no need to hre.getNamedAccounts for example.
//     // hre.getNamedAccounts
//     // hre.deployments
//     const { getNamedAccounts, deployments } = hre
// }
// But instead, we can combine everything with syntactic sugar like this:
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() // video at 10:19:39
    const chainId = network.config.chainId
    log(`Chain ID: ${chainId}`)
    //console.log("Deploying FundMe")
    // if chain id is x, use address y
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if the contract doesn't exist, we deploy a min version for our local testing
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put priceFeed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("-----------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
