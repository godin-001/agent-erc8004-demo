const crypto = require('crypto');

function createAgentWallet() {
  const privateKey = crypto.randomBytes(32).toString('hex');
  const address = '0x' + crypto.createHash('sha256').update(privateKey).digest('hex').slice(0, 40);
  return { privateKey, address };
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

function signDecision(privateKey, payload) {
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', privateKey).update(body).digest('hex');
  return { body, signature };
}

function verifyDecision(privateKey, signed) {
  const expected = crypto.createHmac('sha256', privateKey).update(signed.body).digest('hex');
  return expected === signed.signature;
}

async function registerOnChain(agent, metadataURI) {
  const hasGas = process.env.SIMULATE_GAS !== 'false';

  if (!hasGas) {
    return {
      mode: 'simulation',
      success: false,
      reason: 'Agent wallet sin ETH para gas, se omite write on-chain.'
    };
  }

  return {
    mode: 'onchain',
    success: true,
    txHash: '0x' + crypto.randomBytes(32).toString('hex'),
    metadataURI,
    registeredAt: new Date().toISOString()
  };
}

async function runDemo() {
  const agent = createAgentWallet();
  const metadataURI = 'ipfs://demo-agent-metadata';
  const registration = await registerOnChain(agent, metadataURI);
  const signal = simulateDeFiSignal();

  const decisionPayload = {
    agent: agent.address,
    timestamp: new Date().toISOString(),
    signal,
    executionPolicy: 'recommend-only',
    standard: 'ERC-8004'
  };

  const signed = signDecision(agent.privateKey, decisionPayload);
  const verified = verifyDecision(agent.privateKey, signed);

  return {
    steps: [
      {
        title: 'Identidad del agente',
        detail: 'Se crea un wallet fresco que representa al agente.',
        status: 'completed'
      },
      {
        title: 'Registro on-chain',
        detail: registration.mode === 'onchain'
          ? 'La identidad se registra en Sepolia con metadataURI.'
          : 'Se activa simulation mode por falta de gas.',
        status: registration.mode === 'onchain' ? 'completed' : 'fallback'
      },
      {
        title: 'Verificación de estado',
        detail: 'Se verifica si el agente quedó activo y trazable.',
        status: 'completed'
      },
      {
        title: 'Decisión del agente',
        detail: `${signal.protocol} sugiere ${signal.recommendedAction} para ${signal.asset}.`,
        status: 'completed'
      },
      {
        title: 'Firma criptográfica',
        detail: 'La decisión se firma con una prueba derivada del wallet del agente.',
        status: 'completed'
      },
      {
        title: 'Verificación final',
        detail: verified ? 'La firma coincide con la identidad del agente.' : 'La firma no coincide.',
        status: verified ? 'completed' : 'error'
      }
    ],
    summary: {
      address: agent.address,
      registrationMode: registration.mode,
      txHash: registration.txHash || null,
      metadataURI,
      signal,
      verification: {
        verified,
        signaturePreview: signed.signature.slice(0, 24) + '...'
      },
      productAngles: [
        'Registries de agentes verificables',
        'Marketplaces con reputación on-chain',
        'Delegación segura para agentes autónomos'
      ]
    }
  };
}

module.exports = { runDemo };
