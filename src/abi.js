const abi = [
  'function register(string metadataURI)',
  'function getAgent(address agent) view returns (tuple(address agent, string metadataURI, uint256 registeredAt, bool active))'
];

const bytecode = '0x';

module.exports = { abi, bytecode };
