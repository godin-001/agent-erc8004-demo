const { runDemo } = require('./demo-data');

async function main() {
  console.log('\n=== ERC-8004 Agent Demo ===\n');

  const data = await runDemo();

  console.log('1) Agent wallet created');
  console.log(`   Address: ${data.summary.address}`);

  console.log('\n2) Registration attempt');
  console.log(`   Mode: ${data.summary.registrationMode}`);
  if (data.summary.txHash) console.log(`   Tx hash: ${data.summary.txHash}`);

  console.log('\n3) Registry state verification');
  console.log({
    agent: data.summary.address,
    metadataURI: data.summary.metadataURI,
    active: data.summary.registrationMode === 'onchain',
    proofSource: data.summary.registrationMode === 'onchain' ? 'Sepolia registry' : 'simulation fallback'
  });

  console.log('\n4) Tool calling / decision context');
  console.log(data.summary.signal);

  console.log('\n5) Decision signed');
  console.log({ signature: data.summary.verification.signaturePreview });

  console.log('\n6) Signature verification');
  console.log({
    verified: data.summary.verification.verified,
    signerMatchesAgent: data.summary.verification.verified,
    agent: data.summary.address
  });

  console.log('\nProduct angles:');
  data.summary.productAngles.forEach((angle) => console.log(`- ${angle}`));

  console.log('\nDemo complete.');
}

main().catch((error) => {
  console.error('Agent demo failed:', error);
  process.exit(1);
});
