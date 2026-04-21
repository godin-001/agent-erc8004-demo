# agent-erc8004-demo

Demo funcional para explorar cómo construir **agentes con identidad on-chain** usando **ERC-8004**.

La idea central es simple pero poderosa: si un agente autónomo puede tener una identidad registrable, verificable y revocable en blockchain, entonces podemos empezar a tratarlo como un actor confiable dentro de sistemas cripto, marketplaces de agentes, flujos de automatización y apps multi-agent.

Este repo aterriza esa idea en una demo práctica con:
- **registro on-chain** de la identidad del agente
- **verificación pública** de su estado
- **firma criptográfica** de decisiones
- **kill-switch** para control operativo
- **simulation mode** para que la demo no falle por gas

## ¿Por qué importa ERC-8004 para agentes?

Hoy muchos agentes de IA operan como procesos opacos: producen outputs, llaman tools y toman decisiones, pero su identidad y trazabilidad suelen vivir fuera del sistema.

Con un estándar como ERC-8004, un agente puede:
- tener una **dirección propia** como identidad verificable
- registrar metadatos sobre su rol, capacidades o endpoint
- demostrar autoría de acciones mediante **firmas ECDSA**
- ser **descubierto, auditado o revocado** on-chain
- integrarse mejor con wallets, contratos, permisos y marketplaces

En otras palabras, ERC-8004 ayuda a pasar de un agente tipo "script inteligente" a un agente tipo **actor on-chain con reputación, permisos y trazabilidad**.

## Qué demuestra este repo

Esta demo cubre el flujo mínimo para volver tangible esa visión:

1. El agente crea un **wallet fresco**.
2. Ese wallet se usa como **identidad del agente**.
3. El agente intenta registrarse en un **AgentRegistry** en Sepolia.
4. El sistema lee el estado del registro para verificar que existe.
5. El agente toma una decisión basada en contexto simulado.
6. Esa decisión se **firma criptográficamente**.
7. Se verifica que la firma proviene de la misma identidad registrada.

Eso conecta tres capas importantes:
- **identidad**
- **acción**
- **verificación**

## Caso de uso que inspira el demo

Imagina un agente DeFi que:
- observa yields o tasas
- recomienda una acción
- firma esa recomendación
- deja trazabilidad sobre qué identidad tomó la decisión
- puede ser desactivado o revocado si algo sale mal

Ese patrón también sirve para:
- agentes de compliance
- agentes de soporte con permisos limitados
- bots de ejecución on-chain
- coordinadores multi-agent
- marketplaces de agentes verificables

## Estructura

```text
agent-erc8004-demo/
├── contracts/
│   └── AgentRegistry.sol      # contrato base para registrar agentes
├── scripts/
│   ├── deploy.js              # despliegue en Sepolia
│   └── verify.js              # verificación de estado on-chain
├── src/
│   ├── agent.js               # flujo principal del agente
│   └── abi.js                 # ABI y bytecode del contrato
├── .env.example
├── package.json
└── README.md
```

## Contrato: AgentRegistry

El contrato incluido implementa una base simple pero útil para demos y extensiones:
- `register(metadataURI)` para registrar al agente
- `getAgent(address)` para leer su estado
- `revoke(address)` para desactivar agentes
- `setKillSwitch(bool)` para pausar operaciones

También incluye:
- **custom errors**
- **eventos on-chain**
- **owner controls**
- **kill-switch**

## Flujo de la demo

### 1. Crear identidad
Se genera un wallet nuevo. Esa dirección representa al agente.

### 2. Registrar identidad on-chain
El agente intenta llamar `registry.register()` en Sepolia con un `metadataURI`.

### 3. Verificar registro
Luego lee de vuelta el estado del contrato para demostrar que la identidad existe y está activa.

### 4. Tomar una decisión
El agente consume contexto externo o simulado, por ejemplo una señal de DeFi.

### 5. Firmar la decisión
La salida del agente se firma con ECDSA para probar autoría.

### 6. Validar consistencia
Se verifica que el signer recuperado coincide con la dirección del agente registrada.

## Simulation mode

Una de las decisiones más importantes para una demo en vivo es que **no falle por una razón tonta**.

Por eso este repo contempla un **simulation mode**:
- si el wallet del agente no tiene ETH para gas
- el flujo de registro on-chain se salta elegantemente
- pero el agente sigue tomando decisiones y firmando

Esto hace que la demo siga siendo útil incluso cuando no hay fondos en el momento.

## Cómo podría evolucionar a producto

Este repo no solo sirve como demo técnica. También apunta a una dirección de producto bastante fuerte.

### 1. Registro de agentes verificables
Un directorio donde cada agente tenga:
- identidad on-chain
- metadataURI
- dueño u operador
- permisos declarados
- estado activo/inactivo

### 2. Reputación de agentes
Agregar:
- historial de acciones
- score de confiabilidad
- slashing o penalizaciones
- attestations externas

### 3. Delegación y ejecución
Permitir que un agente:
- ejecute acciones dentro de límites definidos
- opere con permisos mínimos
- tenga políticas on-chain o híbridas

### 4. Multi-agent coordination
Un sistema donde varios agentes:
- negocian tareas
- firman decisiones parciales
- delegan subtareas
- dejan trail verificable de coordinación

### 5. Agent marketplace
Los usuarios podrían descubrir agentes por:
- tipo de tarea
- reputación
- costo
- chain soportada
- permisos y capacidades

## Quick start

```bash
npm install
cp .env.example .env
npm run start
```

## Scripts

- `npm run start`
- `npm run deploy`
- `npm run verify`
- `npm run dev` para abrir una landing local en `http://localhost:3000`

## Landing visual

El repo ahora incluye un `index.html` con una landing más robusta que:
- consume datos reales desde `api/demo`
- muestra el flujo del agente con estados dinámicos
- expone la señal activa, la firma y el modo de registro
- conecta mejor la tesis de ERC-8004 con una experiencia visual más seria

Esto ayuda a mostrar la idea más rápido a builders, judges o posibles colaboradores.

## API de demo

Se agregó un endpoint `api/demo` que genera un payload JSON con:
- identidad del agente
- modo de registro
- señal observada
- verificación de firma
- ángulos de producto

La landing usa ese endpoint para renderizar datos en vivo.

## Qué mejoraría después

Los siguientes upgrades harían que esta demo suba mucho de nivel:
- metadata estructurada para capacidades del agente
- verificación de firmas real dentro del flujo
- integración con feeds o APIs reales
- soporte para múltiples redes
- frontend para registrar y explorar agentes
- reputación o attestations
- permisos delegados por usuario

## Mensaje clave del proyecto

**ERC-8004 no es solo un estándar técnico. Es una pieza para volver a los agentes más legibles, auditables y componibles dentro del stack on-chain.**

Ese es el corazón de este repo.
