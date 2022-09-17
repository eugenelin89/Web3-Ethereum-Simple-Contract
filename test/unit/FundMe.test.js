const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") //  "1000000000000000000" // 1 eth

          beforeEach(async function () {
              // deploy our fundMe contract
              // using hardhat deploy
              // const { deployer } = await getNamedAccounts()
              //const namedAcc = await getNamedAccounts()
              //deployer = namedAcc.deployer
              deployer = (await getNamedAccounts()).deployer

              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              // we could also do it like this:
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]
              //console.log(`namedAcc is ${namedAcc}`)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed() //s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
                  //console.log(`mockV3Aggregator.address: ${mockV3Aggregator.address}`)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enough Eth", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of finders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              this.beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw Eth from a single funder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt // pull out of the object
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw with multiple funders", async function () {
                  // arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      // i = 0 is the deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // ACT
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // pull out of the object
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("only allows the owner to withdrawl", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(
                      attackerConnectedContract,
                      "FundMe__NotOwner"
                  ) // https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/1483https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/1483
              })

              it("cheaperWithdraw testing ...", async function () {
                  // arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      // i = 0 is the deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // ACT
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // pull out of the object
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
