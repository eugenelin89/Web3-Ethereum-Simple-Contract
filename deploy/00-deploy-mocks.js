const { network } = require("hardhat")
const {
    developmentChains,
    DECIMAL,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    //console.log("Deploying Mocks.")
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() // video 10:19:39
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMAL, INITIAL_ANSWER], // for the constructor
        })
        log("Mocks deployed!")
        log("--------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
