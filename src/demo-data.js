const crypto = require('crypto');
const { JsonRpcProvider, Wallet, Contract, verifyMessage } = require('ethers');
const { abi } = require('./abi');

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

function getConfig() {
  return {
    rpcUrl: process.env.SEPOLIA_RPC_URL || '',
    privateKey: process.env.PRIVATE_KEY || '',
    registryAddress: process.env.REGISTRY_ADDRESS || ''
  };
}

function shorten(value, start = 6, end = 4) {
  if (!value || value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function simulateDeFiSignal() {
  const apy = (8 + Math.random() * 7).toFixed(2);
  const risk = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
  const action = Number(apy) > 11 ? 'rebalance-to-yield-vault' : 'hold-position';
  return {
    protocol: 'DemoSwap',
    asset: 'USDC',
    observedApy: `${apy}%`,
    risk,
    recommendedAction: action,
    reason: action === 'rebalance-to-yield-vault'
      ? 'Yield superior al umbral configurado por el agente.'
      : 'Las condiciones actuales no justifican mover capital.'
  };
}

async function loadOnchainContext() {
  const config = getConfig();

  if (!config.rpcUrl || !config.privateKey || !config.registryAddress) {
    return {
      available: false,
      mode: 'simulation',
      reason: 'Faltan SEPOLIA_RPC_URL, PRIVATE_KEY o REGISTRY_ADDRESS.'
    };
  }

  const provider = new JsonRpcProvider(config.rpcUrl, SEPOLIA_CHAIN_ID);
  const wallet = new Wallet(config.privateKey, provider);
  const registry = new Contract(config.registryAddress, abi, provider);

  const [network, balance, agentRecord, paused] = await Promise.all([
    provider.getNetwork(),
    provider.getBalance(wallet.address),
    registry.getAgent(wallet.address),
    registry.paused().catch(() => false)
  ]);

  return {
    available: true,
    mode: agentRecord && agentRecord.active ? 'onchain' : 'wallet-ready',
    provider,
    wallet,
    network: {
      chainId: Number(network.chainId),
      name: network.name
    },
    registry: {
      address: config.registryAddress,
      explorerUrl: `${SEPOLIA_EXPLORER}/address/${config.registryAddress}`,
      paused: Boolean(paused)
    },
    agentRecord: {
      agent: agentRecord.agent,
      metadataURI: agentRecord.metadataURI,
      registeredAt: agentRecord.registeredAt ? Number(agentRecord.registeredAt) : 0,
      active: Boolean(agentRecord.active)
    },
    balanceWei: balance.toString(),
    balanceEth: Number(balance) / 1e18
  };
}

async function signDecision(wallet, payload) {
  const body = JSON.stringify(payload);
  const signature = await wallet.signMessage(body);
  return { body, signature };
}

async function verifyDecision(address, signed) {
  const recovered = verifyMessage(signed.body, signed.signature);
  return {
    verified: recovered.toLowerCase() === address.toLowerCase(),
    recoveredAddress: recovered
  };
}

async function runDemo() {
  const signal = simulateDeFiSignal();
  const onchain = await loadOnchainContext();

  const agentAddress = onchain.available ? onchain.wallet.address : '0x0000000000000000000000000000000000000000';
  const metadataURI = onchain.available && onchain.agentRecord.metadataURI
    ? onchain.agentRecord.metadataURI
    : 'ipfs://demo-agent-metadata';

  const decisionPayload = {
    agent: agentAddress,
    timestamp: new Date().toISOString(),
    signal,
    executionPolicy: 'recommend-only',
    standard: 'ERC-8004',
    registryAddress: onchain.available ? onchain.registry.address : null
  };

  let verification = {
    verified: false,
    signaturePreview: null,
    recoveredAddress: null
  };

  if (onchain.available) {
    const signed = await signDecision(onchain.wallet, decisionPayload);
    const verified = await verifyDecision(onchain.wallet.address, signed);
    verification = {
      verified: verified.verified,
      signaturePreview: shorten(signed.signature, 12, 10),
      recoveredAddress: verified.recoveredAddress
    };
  }

  const registrationMode = onchain.available ? onchain.mode : 'simulation';
  const isRegistered = onchain.available && onchain.agentRecord.active;

  return {
    steps: [
      {
        title: 'Identidad del agente',
        detail: onchain.available
          ? `Se usa un wallet real en Sepolia: ${shorten(onchain.wallet.address)}.`
          : 'Falta la configuración de Sepolia, así que la demo cae en simulation mode.',
        status: onchain.available ? 'completed' : 'fallback'
      },
      {
        title: 'Registro on-chain',
        detail: isRegistered
          ? 'El agente ya aparece registrado y activo en el AgentRegistry.'
          : onchain.available
            ? 'El wallet está listo, pero todavía no aparece activo en el registry.'
            : onchain.reason,
        status: isRegistered ? 'completed' : 'fallback'
      },
      {
        title: 'Verificación de estado',
        detail: onchain.available
          ? `Contrato ${shorten(onchain.registry.address)} en chainId ${onchain.network.chainId}.`
          : 'No se pudo verificar estado real porque faltan credenciales/config.',
        status: onchain.available ? 'completed' : 'fallback'
      },
      {
        title: 'Decisión del agente',
        detail: `${signal.protocol} sugiere ${signal.recommendedAction} para ${signal.asset}.`,
        status: 'completed'
      },
      {
        title: 'Firma criptográfica',
        detail: onchain.available
          ? 'La decisión se firma con el wallet real del agente.'
          : 'La firma real queda pendiente hasta conectar el wallet del agente.',
        status: onchain.available ? 'completed' : 'fallback'
      },
      {
        title: 'Verificación final',
        detail: verification.verified
          ? 'La firma coincide con la identidad on-chain del agente.'
          : 'La verificación final depende de tener wallet y registry configurados.',
        status: verification.verified ? 'completed' : 'fallback'
      }
    ],
    summary: {
      address: agentAddress,
      shortAddress: shorten(agentAddress),
      registrationMode,
      txHash: null,
      metadataURI,
      signal,
      verification,
      contract: onchain.available ? {
        address: onchain.registry.address,
        shortAddress: shorten(onchain.registry.address),
        explorerUrl: onchain.registry.explorerUrl,
        chainId: onchain.network.chainId,
        chainName: onchain.network.name,
        paused: onchain.registry.paused
      } : null,
      agentRecord: onchain.available ? {
        active: onchain.agentRecord.active,
        registeredAt: onchain.agentRecord.registeredAt,
        explorerUrl: `${SEPOLIA_EXPLORER}/address/${agentAddress}`
      } : null,
      balanceEth: onchain.available ? onchain.balanceEth.toFixed(6) : null,
      productAngles: [
        'Registries de agentes verificables',
        'Marketplaces con reputación on-chain',
        'Delegación segura para agentes autónomos'
      ]
    }
  };
}

module.exports = { runDemo };
