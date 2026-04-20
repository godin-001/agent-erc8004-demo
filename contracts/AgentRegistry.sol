// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentRegistry {
    error AgentAlreadyRegistered(address agent);
    error AgentNotRegistered(address agent);
    error RegistryPaused();

    event AgentRegistered(address indexed agent, string metadataURI, uint256 registeredAt);
    event AgentRevoked(address indexed agent, uint256 revokedAt);
    event KillSwitchSet(bool paused);

    struct AgentRecord {
        address agent;
        string metadataURI;
        uint256 registeredAt;
        bool active;
    }

    mapping(address => AgentRecord) public agents;
    bool public paused;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert RegistryPaused();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function register(string calldata metadataURI) external whenNotPaused {
        if (agents[msg.sender].active) revert AgentAlreadyRegistered(msg.sender);

        agents[msg.sender] = AgentRecord({
            agent: msg.sender,
            metadataURI: metadataURI,
            registeredAt: block.timestamp,
            active: true
        });

        emit AgentRegistered(msg.sender, metadataURI, block.timestamp);
    }

    function revoke(address agent) external onlyOwner {
        if (!agents[agent].active) revert AgentNotRegistered(agent);
        agents[agent].active = false;
        emit AgentRevoked(agent, block.timestamp);
    }

    function setKillSwitch(bool _paused) external onlyOwner {
        paused = _paused;
        emit KillSwitchSet(_paused);
    }

    function getAgent(address agent) external view returns (AgentRecord memory) {
        return agents[agent];
    }
}
