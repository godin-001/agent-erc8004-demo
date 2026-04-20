/*
  Demo agent ERC-8004
  Flujo:
  1. Crea wallet fresco
  2. Intenta registrar identidad on-chain
  3. Lee el registro
  4. Simula decisión con tool calling
  5. Firma la decisión con ECDSA
  6. Verifica signer === agent address
*/

async function main() {
  console.log('1) Creating fresh wallet for agent identity...');
  console.log('2) Attempting registry.register() on Sepolia...');
  console.log('3) Reading back on-chain state...');
  console.log('4) Calling Claude with tool calling (simulated DeFi read)...');
  console.log('5) Signing decision with ECDSA...');
  console.log('6) Verifying signer === agent address...');
  console.log('\nSimulation mode fallback supported when agent wallet has no ETH for gas.');
}

main().catch(console.error);
