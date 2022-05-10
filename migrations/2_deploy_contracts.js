var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    const contract = await deployer.deploy(RockPaperScissors);
  });
};

