const abi = [
  'function register(string metadataURI)',
  'function getAgent(address agent) view returns (tuple(address agent, string metadataURI, uint256 registeredAt, bool active))',
  'function paused() view returns (bool)',
  'function owner() view returns (address)'
];

module.exports = { abi };
