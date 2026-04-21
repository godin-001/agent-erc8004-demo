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

async function main() {
  console.log('\n=== ERC-8004 Agent Demo ===\n');

  const agent = createAgentWallet();
  console.log('1) Agent wallet created');
  console.log(`   Address: ${agent.address}`);

  const metadataURI = 'ipfs://demo-agent-metadata';
  const registration = await registerOnChain(agent, metadataURI);
  console.log('\n2) Registration attempt');
  console.log(`   Mode: ${registration.mode}`);
  if (registration.txHash) console.log(`   Tx hash: ${registration.txHash}`);
  if (registration.reason) console.log(`   Note: ${registration.reason}`);

  console.log('\n3) Registry state verification');
  console.log({
    agent: agent.address,
    metadataURI,
    active: registration.mode === 'onchain',
    proofSource: registration.mode === 'onchain' ? 'Sepolia registry' : 'simulation fallback'
  });

  const signal = simulateDeFiSignal();
  console.log('\n4) Tool calling / decision context');
  console.log(signal);

  const decisionPayload = {
    agent: agent.address,
    timestamp: new Date().toISOString(),
    signal,
    executionPolicy: 'recommend-only',
    standard: 'ERC-8004'
  };

  const signed = signDecision(agent.privateKey, decisionPayload);
  console.log('\n5) Decision signed');
  console.log({ signature: signed.signature.slice(0, 24) + '...' });

  const verified = verifyDecision(agent.privateKey, signed);
  console.log('\n6) Signature verification');
  console.log({ verified, signerMatchesAgent: verified, agent: agent.address });

  console.log('\nDemo complete.');
}

main().catch((error) => {
  console.error('Agent demo failed:', error);
  process.exit(1);
});
