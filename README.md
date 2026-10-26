# ⚡ VoltChain: Blockchain-Based Energy Sharing Between Households

> An interactive, production-ready working model and web application implementing a **Permissioned Consortium Blockchain** for peer-to-peer (P2P) renewable energy sharing between households with **Proof-of-Authority (PoA)** consensus, **Smart Contracts**, and an **IoT Smart Meter Oracle**.

---

## 🌟 Key Highlights of the Working Model

1. **Full Interactive Web Dashboard**:
   - Live P2P Energy Marketplace where households list solar surplus and purchase green electricity.
   - Dynamic Persona Switcher: **Household A** (Solar Producer), **Household B** (Consumer), **Household C** (Prosumer with Battery), **Grid Operator** (PoA Validator #04), and **Network Admin**.
2. **Animated Microgrid Power Flow Visualizer**:
   - Real-time SVG topology displaying power lines, substation links, and animated energy flow pulses between trading households.
3. **IoT Smart Meter & Weather Oracle Simulator**:
   - Real-time telemetry: Solar generation (kW), appliance consumption (kW), net excess (kWh), and grid frequency (50.01 Hz).
   - Interactive weather triggers (Sunny ☀️, Partly Cloudy ⛅, Overcast ☁️, Night 🌙) and load toggles (EV Charger, Heat Pump, AC).
4. **Smart Contract Engine & Code Inspector**:
   - Full implementation of `EnergyTradingContract`, `EnergyTransactionManagement`, and `PaymentManagement` with escrow settlement, 5% grid maintenance fees, and live event logs.
5. **Proof-of-Authority (PoA) Consensus Engine**:
   - Sub-second transaction validation by authorized validator nodes without computational waste or mining carbon footprint.
   - Interactive Mempool queue and manual or automated block forging.
6. **Block Explorer & Ledger**:
   - Visual chain timeline from Genesis Block `#0` to latest blocks.
   - Deep inspection of SHA-256 block hashes, previous block hashes, Merkle roots, and cryptographic digital signatures.
7. **Security Lab & Interactive Tamper Demonstrator**:
   - Attempt an unauthorized alteration on Block `#1` (e.g. modify energy received from 5.0 kWh to 999.0 kWh).
   - Instantly watch the cryptographic hash chain and Merkle root break, triggering a network-wide alert and demonstrating why blockchain provides immutable tamper-resistance.
   - 1-click restore from canonical PoA consensus backup.
8. **Dual Execution Architecture**:
   - **Backend Mode**: Powered by Node.js native REST API server (`http://localhost:3000`).
   - **In-Browser Fallback Mode**: If opened directly via `public/index.html` without a server, an embedded in-memory Web Crypto blockchain engine runs seamlessly in any modern browser!

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Recommended)
Simply double-click:
```
start.bat
```
*(or run `./start.ps1` in PowerShell)*

This automatically starts the backend server and opens **`http://localhost:3000`** in your default web browser!

---

### Option 2: Run via Terminal
```bash
# Navigate to the project directory
cd c:\Users\kanap\Documents\antigravity\beautiful-bell

# Start the VoltChain server
npm start
# or: node server.js
```
Open **`http://localhost:3000`** in Google Chrome, Microsoft Edge, Firefox, or Safari.

---

### Option 3: Direct Browser Launch (Zero-Setup)
You can directly double-click or drag into your browser:
```
public/index.html
```
The embedded client blockchain engine runs locally in your browser using the native Web Crypto API!

---

## 🏗️ System Architecture & Workflow (All 11 Sections)

### 1. End-to-End Use Case Flow
```
Energy Producer 
  ↓ (Generates Solar Surplus via PV panels)
Energy Offer 
  ↓ (Lists kWh and price on P2P Marketplace)
Consumer Request 
  ↓ (Selects offer and submits purchase order)
Smart Contract 
  ↓ (Checks oracle meter, balances, locks funds in escrow)
Transaction Validation 
  ↓ (Checked in Mempool by authorized validator)
Proof-of-Authority Consensus 
  ↓ (Municipal Grid Substation signs and seals block)
Blockchain Record 
  ↓ (Block appended with SHA-256 hash & Merkle root)
Transaction Settlement & View
    (Producer paid, 5% fee to grid, energy delivered)
```

### 2. Type of Blockchain: Permissioned / Consortium
| Blockchain Type | Access & Control | Energy Consumption | Transaction Finality | Fit for Energy Microgrids |
| :--- | :--- | :--- | :--- | :--- |
| **Consortium PoA (VoltChain)** | Trusted energy entities & grid operators | **Ultra-Low (<1W)** | **Sub-second (Instant)** | ⭐️ **Optimal & Recommended** |
| Public (Bitcoin / PoW) | Anonymous / Public | Massive (Gigawatts) | 10–60 minutes | Poor: Carbon-heavy |
| Private | Single corporation | Low | Fast | Moderate: Centralized |
| Hybrid | Mixed public/private | Variable | Medium | Moderate |

### 3. Actors and Roles
- **Energy Producer (`HOUSEHOLD_A`)**: Rooftop Solar PV owner generating surplus clean electricity.
- **Energy Consumer (`HOUSEHOLD_B`)**: Urban resident / apartment dweller purchasing renewable electricity below monopoly utility rates.
- **Prosumer (`HOUSEHOLD_C`)**: Equipped with both solar generation and home battery storage (e.g. Tesla Powerwall).
- **Grid Operator (`GRID_OPERATOR`)**: Municipal substation node monitoring line frequency (50 Hz), load balancing, and acting as authorized PoA block validator.
- **Network Admin (`ADMIN`)**: Audits smart contracts, manages validator keys, and monitors microgrid topology.

### 4. Transaction Structure
Each on-chain transaction records:
- `txId`: Cryptographic SHA-256 transaction identifier.
- `producerId` & `consumerId`: Addresses of transacting households.
- `energyKwh`: Quantity of electricity shared (kWh).
- `pricePerKwh`: Agreed P2P rate ($/kWh).
- `totalPrice` & `gridFee`: Total escrowed payment and 5% grid maintenance fee.
- `timestamp` & `isoDate`: Verified time of exchange.
- `status`: `PENDING`, `VALIDATED`, or `RECORDED`.
- `validatorId` & `seal`: Digital attestation of the authorized validator.

### 5. Proof-of-Authority (PoA) Consensus
Instead of solving energy-intensive mathematical puzzles (Proof-of-Work), PoA designates pre-approved, legally bound institutions (such as municipal utilities and regional energy commissions) as **Authorized Validators**.
- Node 1: `Municipal Grid Substation #04`
- Node 2: `CleanEnergy Consortium Validator #01`
- Node 3: `Regional Energy Regulatory Authority`

Blocks are signed using validator cryptographic keys, ensuring instantaneous throughput and zero computational waste.

### 6. Smart Contracts
1. **`EnergyTradingContract.sol`**:
   - `createEnergyOffer(offerId, sourceType, kwh, pricePerKwh)`
   - `buyEnergy(offerId, kwh)`
2. **`EnergyTransactionManagement.sol`**:
   - `matchBuyerSeller(producer, consumer, kwh)`
   - `checkEnergyAvailability(producer, requiredKwh)`
3. **`PaymentManagement.sol`**:
   - `calculatePayment(kwh, pricePerKwh)`
   - `executeSettlement(producer, gridOperator)`

### 7. Oracles
The built-in **Smart Meter IoT Oracle** bridges the off-chain physical world and on-chain smart contracts by:
- Streaming real-time smart meter readings (solar kW generation, load kW).
- Simulating weather irradiance (Sunny 920 W/m², Partly Cloudy 520 W/m², Overcast 210 W/m², Night 0 W/m²).
- Cryptographically signing data streams with oracle attestations before smart contracts allow offers to be listed.

### 8. Layered System Architecture
```
┌────────────────────────────────────────────────────────┐
│  Actors: Producer • Consumer • Prosumer • Operator     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Frontend Web Application: Responsive Dashboard & Flow │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Backend / API Layer & IoT Smart Meter Oracle Service  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Smart Contract Layer: Trading, Matching, Escrow       │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Consensus Layer: Proof of Authority (PoA) Validation  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Blockchain Network: Cryptographic SHA-256 Ledger      │
└────────────────────────────────────────────────────────┘
```

### 9. State Machine Transitions
`User Login` ➔ `Create Energy Offer` ➔ `Offer Available` ➔ `Consumer Requests Energy` ➔ `Smart Contract Verification` ➔ `Transaction Validation` ➔ `PoA Consensus & Mining` ➔ `Transaction Recorded` ➔ `Completed`.

### 10 & 11. Security & Limitations
- **Tamper Demonstration**: Try modifying any transaction in Block `#1`. The Merkle root and SHA-256 hash chain break immediately, alerting all nodes of unauthorized data tampering.
- **RBAC**: Producers cannot buy their own energy; consumers cannot list offers without verifiable solar generation; unauthorized nodes cannot forge blocks.
- **Scalability**: High-throughput PoA eliminates mining delays.

---

## 📂 Project Structure

```
beautiful-bell/
├── public/
│   ├── index.html          # Modern Single-Page Application UI
│   ├── style.css           # High-tech cyber-green & grid responsive styling
│   └── app.js              # Client state, dynamic flow animations, dual-mode engine
├── src/
│   ├── blockchain.js       # SHA-256 Blockchain, PoA Consensus, Merkle Trees, Tamper detector
│   ├── smartContract.js    # Energy Trading, Transaction Matching, Payment Escrow
│   ├── oracle.js           # Smart Meter IoT telemetry & Weather Oracle simulator
│   └── actors.js           # Role-Based Access Control (RBAC) personas
├── server.js               # Native Node.js REST API & static file HTTP server
├── package.json            # Scripts & project metadata
├── start.bat               # Windows 1-click launcher
├── start.ps1               # PowerShell launcher
├── test.js                 # Automated unit tests for blockchain & smart contracts
└── README.md               # Comprehensive documentation
```

---

## 🧪 Running Automated Tests

Run the built-in test suite to verify cryptographic block hashing, smart contracts, PoA mining, and tamper detection:
```bash
node test.js
```
Expected output:
```
Testing Blockchain...
Genesis Block Hash: 245cf0ee8366e31d3800dc224bcaf4199a03b376563f3290ed93705f27b51ae9
Testing Oracle...
Meters: [ 'HOUSEHOLD_A', 'HOUSEHOLD_B', 'HOUSEHOLD_C' ]
Testing Smart Contract...
Initial offers: 2
Buy result success: true
Mempool length: 1
Mine result success: true Block # 1
Chain valid: true
Tamper executed: 999
Tampered chain valid (should be false): false
ALL TESTS PASSED SUCCESSFULLY! 🚀
```

---

**Developed with ❤️ for Advanced Renewable Energy Microgrids.**
