const hre = require("hardhat");

async function main() {
  const failVault = await hre.ethers.deployContract("FailVault");
  await failVault.waitForDeployment();
  console.log(`FailVault deployed to: ${failVault.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});