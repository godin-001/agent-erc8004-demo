# agent-erc8004-demo

Demo funcional de un agente con identidad on-chain usando ERC-8004, registro en Sepolia, firma ECDSA y simulation mode para demos en vivo.

## Estructura

```text
agent-erc8004-demo/
├── contracts/
│   └── AgentRegistry.sol
├── scripts/
│   ├── deploy.js
│   └── verify.js
├── src/
│   ├── agent.js
│   └── abi.js
├── .env.example
├── package.json
└── README.md
```

## Flujo de la demo

1. Crea un wallet fresco, esa es la identidad del agente.
2. Llama a `registry.register()` en Sepolia.
3. Lee de vuelta los datos del contrato para verificación.
4. Simula una llamada a Claude con tool calling.
5. Firma la decisión con ECDSA.
6. Verifica que el signer coincide con la dirección del agente.

## Nota importante

Si el agent wallet no tiene ETH para gas, entra automáticamente en **simulation mode**. Así la demo puede continuar sin fallar en vivo.

## Scripts

- `npm run start`
- `npm run deploy`
- `npm run verify`
