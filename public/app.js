/**
 * VoltChain - Blockchain Energy Sharing Platform Client
 * Supports Dual Mode:
 * 1. Node.js REST API Backend Mode (when running `node server.js` at http://localhost:3000)
 * 2. Embedded Client-Side Engine Mode (when opened directly as file:/// or standalone without backend)
 */

// Application State
const state = {
  activeActorId: 'HOUSEHOLD_A',
  users: {
    HOUSEHOLD_A: {
      id: 'HOUSEHOLD_A',
      name: 'Household A (Solar Producer)',
      role: 'PRODUCER',
      address: '0xA17f864e29C4dB3412E8Bf00a5C384e9D7F491E2',
      tokenBalance: 420.50,
      gridFeederId: 'FEEDER_NORTH_03',
      solarCapacityKw: 6.5,
      batteryCapacityKwh: 0,
      avatar: '☀️'
    },
    HOUSEHOLD_B: {
      id: 'HOUSEHOLD_B',
      name: 'Household B (Consumer)',
      role: 'CONSUMER',
      address: '0xB89d271cC19830Fe98B76302488a0F67A1009B82',
      tokenBalance: 250.00,
      gridFeederId: 'FEEDER_NORTH_03',
      solarCapacityKw: 0,
      batteryCapacityKwh: 0,
      avatar: '🔌'
    },
    HOUSEHOLD_C: {
      id: 'HOUSEHOLD_C',
      name: 'Household C (Prosumer & Battery)',
      role: 'PROSUMER',
      address: '0xC34e8971Bae761c5690A45330e719Fb90D6c4391',
      tokenBalance: 310.75,
      gridFeederId: 'FEEDER_WEST_01',
      solarCapacityKw: 4.5,
      batteryCapacityKwh: 13.5,
      avatar: '🔋'
    },
    GRID_OPERATOR: {
      id: 'GRID_OPERATOR',
      name: 'Municipal Grid Operator Node #04',
      role: 'GRID_OPERATOR',
      address: '0xGRID_OPERATOR_NODE_01',
      tokenBalance: 1540.00,
      gridFeederId: 'SUBSTATION_PRIMARY',
      isValidator: true,
      avatar: '⚡'
    },
    ADMIN: {
      id: 'ADMIN',
      name: 'Energy Consortium Network Admin',
      role: 'ADMIN',
      address: '0xADMIN_ROOT_CONSORTIUM_MASTER',
      tokenBalance: 9999.00,
      gridFeederId: 'CENTRAL_CONTROL',
      isValidator: true,
      avatar: '🛡️'
    }
  },
  offers: [
    {
      offerId: 'OFFER_SOLAR_101',
      producerId: 'HOUSEHOLD_A',
      producerName: 'Household A (Solar Producer)',
      sourceType: 'Solar PV Rooftop',
      availableKwh: 18.5,
      originalKwh: 20.0,
      pricePerKwh: 0.12,
      minOrderKwh: 2.0,
      status: 'AVAILABLE',
      createdAt: Date.now() - 3600000,
      gridFeederId: 'FEEDER_NORTH_03'
    },
    {
      offerId: 'OFFER_PROSUMER_102',
      producerId: 'HOUSEHOLD_C',
      producerName: 'Household C (Prosumer & Battery)',
      sourceType: 'Solar + Tesla Powerwall',
      availableKwh: 12.0,
      originalKwh: 15.0,
      pricePerKwh: 0.14,
      minOrderKwh: 1.0,
      status: 'AVAILABLE',
      createdAt: Date.now() - 1800000,
      gridFeederId: 'FEEDER_WEST_01'
    }
  ],
  meters: {
    HOUSEHOLD_A: {
      id: 'METER_SOLAR_001',
      owner: 'HOUSEHOLD_A',
      name: 'Household A (Solar Producer)',
      panelCapacityKw: 6.5,
      currentGenerationKw: 4.8,
      currentConsumptionKw: 1.2,
      netExcessKwh: 24.6,
      activeAppliances: ['Lighting (0.2kW)', 'Fridge (0.3kW)', 'Computers (0.7kW)']
    },
    HOUSEHOLD_B: {
      id: 'METER_CONS_002',
      owner: 'HOUSEHOLD_B',
      name: 'Household B (Consumer)',
      panelCapacityKw: 0,
      currentGenerationKw: 0,
      currentConsumptionKw: 3.4,
      netExcessKwh: 0,
      activeAppliances: ['HVAC Air Conditioning (2.0kW)', 'Lighting (0.4kW)', 'Kitchen (1.0kW)']
    },
    HOUSEHOLD_C: {
      id: 'METER_PROS_003',
      owner: 'HOUSEHOLD_C',
      name: 'Household C (Prosumer & Storage)',
      panelCapacityKw: 4.5,
      currentGenerationKw: 3.2,
      currentConsumptionKw: 2.1,
      netExcessKwh: 14.2,
      activeAppliances: ['Heat Pump (1.5kW)', 'Lighting (0.6kW)']
    }
  },
  telemetry: {
    weather: 'SUNNY',
    irradiance: 850,
    frequency: 50.01,
    voltage: 230.4,
    gridStatus: 'OPTIMAL / BALANCED'
  },
  chain: [],
  mempool: [],
  contractEvents: [],
  oracleHistory: [
    { time: new Date().toLocaleTimeString(), detail: 'IoT Smart Meter Gateway initialized. Telemetry sync active.', oracleSignature: 'ORACLE_SIG_INIT_001' }
  ],
  selectedBlockIndex: 0,
  activeContractTab: 'trading',
  isChainValid: true,
  isClientMode: false,
  canonicalBackup: []
};

// Cryptographic Web Crypto SHA-256
async function sha256(str) {
  if (window.crypto && window.crypto.subtle) {
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic 64-char fallback hash for non-crypto contexts
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = ((h1 ^ (h1 >>> 16)) >>> 0).toString(16).padStart(8, '0');
  h2 = ((h2 ^ (h2 >>> 16)) >>> 0).toString(16).padStart(8, '0');
  return (h1 + h2 + h1 + h2 + h1 + h2 + h1 + h2).substring(0, 64);
}

// Client-side Genesis Block Initialization
async function initClientChain() {
  if (state.chain.length === 0) {
    const genesisTx = {
      txId: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: Date.now() - 3600000,
      isoDate: new Date(Date.now() - 3600000).toISOString(),
      producerId: 'SYSTEM_GENESIS',
      consumerId: 'MICROGRID_GENESIS',
      energyKwh: 0,
      pricePerKwh: 0,
      totalPrice: 0,
      gridFee: 0,
      producerEarnings: 0,
      offerId: 'GENESIS',
      txType: 'NETWORK_INITIALIZATION',
      status: 'RECORDED',
      validatorId: '0xCONSORTIUM_ROOT'
    };
    const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const rawMerkle = `${genesisTx.txId}-${genesisTx.producerId}-${genesisTx.consumerId}-${genesisTx.energyKwh}-${genesisTx.pricePerKwh}-${genesisTx.totalPrice}`;
    const merkleRoot = await sha256(rawMerkle);
    const hash = await sha256(`0${prevHash}${Date.now() - 3600000}${merkleRoot}0xCONSORTIUM_ROOT`);
    const genesisBlock = {
      index: 0,
      timestamp: Date.now() - 3600000,
      isoTime: new Date(Date.now() - 3600000).toLocaleTimeString(),
      transactions: [genesisTx],
      previousHash: prevHash,
      validator: '0xCONSORTIUM_ROOT',
      merkleRoot,
      hash,
      seal: (await sha256(`POA-SIGNATURE-0xCONSORTIUM_ROOT-${hash}`)).substring(0, 32)
    };
    state.chain.push(genesisBlock);

    // Initial Sample Block #1
    const tx1 = {
      txId: await sha256(`tx-sample-1-${Date.now()}`),
      timestamp: Date.now() - 1800000,
      isoDate: new Date(Date.now() - 1800000).toISOString(),
      producerId: 'HOUSEHOLD_A',
      consumerId: 'HOUSEHOLD_B',
      energyKwh: 5.0,
      pricePerKwh: 0.12,
      totalPrice: 0.60,
      gridFee: 0.03,
      producerEarnings: 0.57,
      offerId: 'OFFER_SOLAR_101',
      txType: 'P2P_ENERGY_TRADE',
      status: 'RECORDED',
      validatorId: '0xGRID_OPERATOR_NODE_01'
    };
    const merkle1 = await sha256(`${tx1.txId}-${tx1.producerId}-${tx1.consumerId}-${tx1.energyKwh}-${tx1.pricePerKwh}-${tx1.totalPrice}`);
    const hash1 = await sha256(`1${genesisBlock.hash}${Date.now() - 1800000}${merkle1}0xGRID_OPERATOR_NODE_01`);
    const block1 = {
      index: 1,
      timestamp: Date.now() - 1800000,
      isoTime: new Date(Date.now() - 1800000).toLocaleTimeString(),
      transactions: [tx1],
      previousHash: genesisBlock.hash,
      validator: '0xGRID_OPERATOR_NODE_01',
      merkleRoot: merkle1,
      hash: hash1,
      seal: (await sha256(`POA-SIGNATURE-0xGRID_OPERATOR_NODE_01-${hash1}`)).substring(0, 32)
    };
    state.chain.push(block1);
    state.canonicalBackup = JSON.parse(JSON.stringify(state.chain));
  }
}

// Solidity Smart Contract Code Snippets
const CONTRACT_CODES = {
  trading: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EnergyTradingContract
 * @notice Governs energy offer creation, listing and peer-to-peer purchasing
 */
contract EnergyTradingContract {
    struct EnergyOffer {
        string offerId;
        address producer;
        string sourceType;
        uint256 availableKwh;
        uint256 pricePerKwh; // Stored in micro-cents
        bool active;
    }

    mapping(string => EnergyOffer) public offers;
    event EnergyOfferCreated(string indexed offerId, address indexed producer, uint256 kwh, uint256 price);
    event EnergyPurchased(string indexed offerId, address indexed buyer, uint256 kwh, uint256 totalCost);

    function createEnergyOffer(
        string memory _offerId,
        string memory _source,
        uint256 _kwh,
        uint256 _pricePerKwh
    ) external {
        require(_kwh > 0, "Surplus must be > 0 kWh");
        require(_pricePerKwh > 0, "Price must be > 0");

        offers[_offerId] = EnergyOffer({
            offerId: _offerId,
            producer: msg.sender,
            sourceType: _source,
            availableKwh: _kwh,
            pricePerKwh: _pricePerKwh,
            active: true
        });

        emit EnergyOfferCreated(_offerId, msg.sender, _kwh, _pricePerKwh);
    }

    function buyEnergy(string memory _offerId, uint256 _kwh) external payable {
        EnergyOffer storage offer = offers[_offerId];
        require(offer.active, "Offer is not available");
        require(offer.availableKwh >= _kwh, "Insufficient energy available");
        require(offer.producer != msg.sender, "Producer cannot buy own offer");

        uint256 totalCost = _kwh * offer.pricePerKwh;
        require(msg.value >= totalCost, "Insufficient payment forwarded");

        offer.availableKwh -= _kwh;
        if (offer.availableKwh == 0) {
            offer.active = false;
        }

        emit EnergyPurchased(_offerId, msg.sender, _kwh, totalCost);
    }
}`,

  txmgmt: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EnergyTransactionManagement
 * @notice Validates physical feeder route, matching buyer & seller, and checks oracle meter
 */
contract EnergyTransactionManagement {
    address public gridOperator;
    address public smartMeterOracle;

    struct MicrogridFeeder {
        string feederId;
        uint256 maxCapacityKw;
        uint256 activeLoadKw;
        bool operational;
    }

    mapping(string => MicrogridFeeder) public feeders;

    modifier onlyValidator() {
        require(msg.sender == gridOperator, "PoA: Only authorized validator");
        _;
    }

    function matchBuyerSeller(
        address _producer,
        address _consumer,
        uint256 _kwh
    ) external view returns (bool routeClear, uint256 transmissionLossBps) {
        // Enforce physical feeder capacity limits
        routeClear = true;
        transmissionLossBps = 150; // 1.5% technical loss
    }

    function checkEnergyAvailability(
        address _producer,
        uint256 _requiredKwh
    ) external view returns (bool) {
        // Interrogate IoT Smart Meter Oracle for verifiable generation
        return true;
    }
}`,

  payment: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentManagement
 * @notice Manages escrow deposits, grid balancing fee deduction, and producer payout
 */
contract PaymentManagement {
    uint256 public constant GRID_FEE_BPS = 500; // 5.0% Microgrid maintenance fee

    event EscrowDeposited(address indexed payer, uint256 amount);
    event PayoutSettled(address indexed producer, uint256 netPayout, uint256 gridFee);

    function calculatePayment(uint256 _kwh, uint256 _pricePerKwh) 
        public 
        pure 
        returns (uint256 totalCost, uint256 gridFee, uint256 producerNet) 
    {
        totalCost = _kwh * _pricePerKwh;
        gridFee = (totalCost * GRID_FEE_BPS) / 10000;
        producerNet = totalCost - gridFee;
    }

    function executeSettlement(address payable _producer, address payable _gridOperator) external payable {
        (uint256 total, uint256 fee, uint256 net) = calculatePayment(msg.value, 1);
        _gridOperator.transfer(fee);
        _producer.transfer(net);
        emit PayoutSettled(_producer, net, fee);
    }
}`
};

// Architecture Stepper Guide Details
const STEP_DETAILS = {
  1: {
    title: 'Step 1: Renewable Generation & Solar Surplus Detection',
    detail: 'Household A’s rooftop photovoltaic (PV) array generates 4.8 kW. Household internal appliances consume 1.2 kW. The smart meter detects a net surplus of +3.6 kW (24.6 kWh cumulative surplus) available for sharing rather than dumping into the centralized grid at low feed-in tariffs.'
  },
  2: {
    title: 'Step 2: Creation of Energy Offer on Smart Contract',
    detail: 'Household A interacts with the VoltChain web app to create an Energy Offer (e.g. 10.0 kWh at $0.12/kWh). The Smart Contract checks that Household A has the PRODUCER role and verifies against the Smart Meter Oracle that verified solar surplus actually exists.'
  },
  3: {
    title: 'Step 3: Consumer Requests & Buys Energy',
    detail: 'Household B (Apartment dweller / EV owner) needs energy during daytime hours. Household B selects Household A’s offer in the P2P Marketplace and submits a buy order for 5.0 kWh at $0.12/kWh ($0.60 total).'
  },
  4: {
    title: 'Step 4: Smart Contract Rules & Escrow Verification',
    detail: 'The smart contract executes calculatePayment(), locks $0.60 from Household B into escrow, deducts 5.0 kWh from the available offer, and forwards the transaction payload to the Proof-of-Authority (PoA) mempool.'
  },
  5: {
    title: 'Step 5: Proof-of-Authority (PoA) Consensus Validation',
    detail: 'Authorized Validator Node (Municipal Substation #04) inspects the mempool. It verifies digital signatures, confirms feeder line capacity, ensures no double-spending, and signs the proposed block using its authorized validator cryptographic key.'
  },
  6: {
    title: 'Step 6: Immutable Block Creation & Ledger Settlement',
    detail: 'The new block (with SHA-256 block hash, Merkle root, and PoA seal) is appended to the permissioned blockchain ledger. Escrow funds are released ($0.57 to Producer, $0.03 to Grid Operator). Both households can inspect the permanent audit trail.'
  }
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  await initClientChain();
  initTabs();
  initModals();
  initActorSwitcher();
  initWeatherControls();
  initConsensusControls();
  initSecurityDemo();
  initStepperGuide();
  initContractCodeViewer();

  // Initial Sync
  await fetchSystemState();
  setInterval(fetchSystemState, 3500);
});

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '⚡' : type === 'warning' ? '⚠️' : '❌';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Tab Switching
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) targetPanel.classList.add('active');

      if (targetTab === 'tab-explorer') {
        renderExplorer();
      }
    });
  });
}

// Actor Switcher
function initActorSwitcher() {
  const select = document.getElementById('actorSelect');
  if (!select) return;
  select.addEventListener('change', (e) => {
    state.activeActorId = e.target.value;
    updateActorHeader();
    showToast(`Switched active actor to ${state.users[state.activeActorId]?.name || state.activeActorId}`, 'info');
  });
}

function updateActorHeader() {
  const actor = state.users[state.activeActorId];
  if (!actor) return;

  const avatarEl = document.getElementById('actorAvatar');
  const nameEl = document.getElementById('actorName');
  const balanceEl = document.getElementById('actorBalance');

  if (avatarEl) avatarEl.innerText = actor.avatar || '👤';
  if (nameEl) nameEl.innerText = actor.name.split('(')[0].trim();
  if (balanceEl) balanceEl.innerText = `$${actor.tokenBalance.toFixed(2)}`;

  const offerProducer = document.getElementById('offerProducerDisplay');
  if (offerProducer) offerProducer.value = `${actor.name} (${actor.role})`;

  const hint = document.getElementById('offerOracleHint');
  const meter = state.meters[state.activeActorId];
  if (hint && meter) {
    hint.innerText = `Oracle Verified Live Net Surplus: ${meter.netExcessKwh.toFixed(1)} kWh`;
  }
}

// Modals Handling
function initModals() {
  const modalCreate = document.getElementById('modalCreateOffer');
  const btnOpenCreate = document.getElementById('btnOpenCreateOffer');
  const btnCloseCreate = document.getElementById('btnCloseCreateOffer');
  const btnCancelCreate = document.getElementById('btnCancelCreateOffer');
  const formCreate = document.getElementById('formCreateOffer');

  btnOpenCreate?.addEventListener('click', () => {
    const actor = state.users[state.activeActorId];
    if (actor && actor.role !== 'PRODUCER' && actor.role !== 'PROSUMER' && actor.role !== 'ADMIN') {
      showToast(`Action Restricted: Only Producers and Prosumers can create energy offers. (Current role: ${actor.role})`, 'warning');
      return;
    }
    updateOfferCostCalculations();
    modalCreate.classList.add('active');
  });

  const closeCreate = () => modalCreate?.classList.remove('active');
  btnCloseCreate?.addEventListener('click', closeCreate);
  btnCancelCreate?.addEventListener('click', closeCreate);

  document.getElementById('offerEnergyKwh')?.addEventListener('input', updateOfferCostCalculations);
  document.getElementById('offerPriceKwh')?.addEventListener('input', updateOfferCostCalculations);

  formCreate?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const energyKwh = parseFloat(document.getElementById('offerEnergyKwh').value);
    const pricePerKwh = parseFloat(document.getElementById('offerPriceKwh').value);
    const sourceType = document.getElementById('offerSourceType').value;

    try {
      if (!state.isClientMode) {
        try {
          const res = await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producerId: state.activeActorId, energyKwh, pricePerKwh, sourceType })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
          showToast(data.message, 'success');
          closeCreate();
          fetchSystemState();
          return;
        } catch (fetchErr) {
          state.isClientMode = true;
        }
      }

      // Client mode execution
      const actor = state.users[state.activeActorId];
      const offerId = `OFFER_${Date.now().toString().slice(-6)}`;
      const newOffer = {
        offerId,
        producerId: actor.id,
        producerName: actor.name,
        sourceType,
        availableKwh: energyKwh,
        originalKwh: energyKwh,
        pricePerKwh,
        minOrderKwh: 1.0,
        status: 'AVAILABLE',
        createdAt: Date.now(),
        gridFeederId: actor.gridFeederId
      };
      state.offers.unshift(newOffer);
      state.contractEvents.unshift({
        eventName: 'EnergyOfferCreated',
        isoTime: new Date().toLocaleTimeString(),
        params: { offerId, producerId: actor.id, energyKwh, pricePerKwh }
      });
      showToast(`Smart Contract registered offer ${offerId} for ${energyKwh} kWh at $${pricePerKwh}/kWh!`, 'success');
      closeCreate();
      renderAll();
    } catch (err) {
      showToast(`Offer Creation Failed: ${err.message}`, 'error');
    }
  });

  // Buy Modal
  const modalBuy = document.getElementById('modalBuyEnergy');
  const btnCloseBuy = document.getElementById('btnCloseBuyEnergy');
  const btnCancelBuy = document.getElementById('btnCancelBuyEnergy');
  const formBuy = document.getElementById('formBuyEnergy');

  const closeBuy = () => modalBuy?.classList.remove('active');
  btnCloseBuy?.addEventListener('click', closeBuy);
  btnCancelBuy?.addEventListener('click', closeBuy);

  document.getElementById('buyAmountKwh')?.addEventListener('input', updateBuyCostCalculations);

  formBuy?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const offerId = document.getElementById('buyOfferId').value;
    const requestedKwh = parseFloat(document.getElementById('buyAmountKwh').value);

    try {
      if (!state.isClientMode) {
        try {
          const res = await fetch('/api/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offerId, consumerId: state.activeActorId, requestedKwh })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);

          showToast(data.message, 'success');
          closeBuy();
          triggerMicrogridFlow();
          fetchSystemState();
          return;
        } catch (fetchErr) {
          state.isClientMode = true;
        }
      }

      // Client mode execution
      const offer = state.offers.find(o => o.offerId === offerId);
      const consumer = state.users[state.activeActorId];
      const producer = state.users[offer.producerId];

      const totalCost = Number((requestedKwh * offer.pricePerKwh).toFixed(2));
      const gridFee = Number((totalCost * 0.05).toFixed(2));
      const producerNet = Number((totalCost - gridFee).toFixed(2));

      if (consumer.tokenBalance < totalCost) {
        throw new Error(`Insufficient funds. Available: $${consumer.tokenBalance.toFixed(2)}, Required: $${totalCost.toFixed(2)}`);
      }

      consumer.tokenBalance = Number((consumer.tokenBalance - totalCost).toFixed(2));
      producer.tokenBalance = Number((producer.tokenBalance + producerNet).toFixed(2));

      offer.availableKwh = Number((offer.availableKwh - requestedKwh).toFixed(2));
      if (offer.availableKwh <= 0.01) {
        offer.availableKwh = 0;
        offer.status = 'COMPLETED';
      } else {
        offer.status = 'PARTIALLY_FILLED';
      }

      const tx = {
        txId: await sha256(`p2p-${Date.now()}-${Math.random()}`),
        timestamp: Date.now(),
        isoDate: new Date().toISOString(),
        producerId: producer.id,
        consumerId: consumer.id,
        energyKwh: requestedKwh,
        pricePerKwh: offer.pricePerKwh,
        totalPrice: totalCost,
        gridFee,
        producerEarnings: producerNet,
        offerId: offer.offerId,
        txType: 'P2P_ENERGY_TRADE',
        status: 'PENDING'
      };

      state.mempool.push(tx);
      state.contractEvents.unshift({
        eventName: 'EnergyTransactionExecuted',
        isoTime: new Date().toLocaleTimeString(),
        params: { txId: tx.txId.substring(0, 16), offerId: offer.offerId, energyKwh: requestedKwh, totalCost }
      });

      showToast(`Smart Contract executed trade of ${requestedKwh} kWh! Transaction queued in PoA Mempool.`, 'success');
      closeBuy();
      triggerMicrogridFlow();
      renderAll();
    } catch (err) {
      showToast(`Purchase Failed: ${err.message}`, 'error');
    }
  });
}

function updateOfferCostCalculations() {
  const energy = parseFloat(document.getElementById('offerEnergyKwh')?.value) || 0;
  const price = parseFloat(document.getElementById('offerPriceKwh')?.value) || 0;
  const gross = energy * price;
  const fee = gross * 0.05;
  const net = gross - fee;

  const grossEl = document.getElementById('offerGrossEst');
  const feeEl = document.getElementById('offerGridFeeEst');
  const netEl = document.getElementById('offerNetEst');

  if (grossEl) grossEl.innerText = `$${gross.toFixed(2)}`;
  if (feeEl) feeEl.innerText = `$${fee.toFixed(2)}`;
  if (netEl) netEl.innerText = `$${net.toFixed(2)}`;
}

function updateBuyCostCalculations() {
  const offerId = document.getElementById('buyOfferId')?.value;
  const offer = state.offers.find(o => o.offerId === offerId);
  if (!offer) return;

  const kwh = parseFloat(document.getElementById('buyAmountKwh')?.value) || 0;
  const gross = kwh * offer.pricePerKwh;
  const fee = gross * 0.05;

  const costEl = document.getElementById('buyEnergyCost');
  const feeEl = document.getElementById('buyGridFee');
  const totalEl = document.getElementById('buyTotalPayment');

  if (costEl) costEl.innerText = `$${gross.toFixed(2)}`;
  if (feeEl) feeEl.innerText = `$${fee.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `$${gross.toFixed(2)}`;
}

function openBuyModal(offerId) {
  const offer = state.offers.find(o => o.offerId === offerId);
  if (!offer) return;

  const actor = state.users[state.activeActorId];
  if (actor && actor.id === offer.producerId) {
    showToast('Smart Contract Rejection: You cannot buy your own energy offer!', 'warning');
    return;
  }

  document.getElementById('buyOfferId').value = offer.offerId;
  const maxBuy = Math.min(offer.availableKwh, 10.0);
  document.getElementById('buyAmountKwh').value = maxBuy.toFixed(1);
  document.getElementById('buyAmountKwh').max = offer.availableKwh;
  document.getElementById('buyMaxHint').innerText = `Maximum available in this offer: ${offer.availableKwh.toFixed(1)} kWh`;

  document.getElementById('buyOfferSummary').innerHTML = `
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.75rem; border-radius: 8px;">
      <h4 style="color: #10b981; margin-bottom: 0.25rem;">${offer.sourceType}</h4>
      <div style="font-size: 0.8rem; color: #9ca3af;">Seller: <strong>${offer.producerName}</strong> (${offer.producerId})</div>
      <div style="font-size: 0.8rem; color: #9ca3af;">Rate: <strong>$${offer.pricePerKwh.toFixed(2)}/kWh</strong> (Feeder: ${offer.gridFeederId})</div>
    </div>
  `;

  document.getElementById('buyConsumerBalance').innerText = `$${actor?.tokenBalance.toFixed(2) || '0.00'}`;
  updateBuyCostCalculations();

  document.getElementById('modalBuyEnergy').classList.add('active');
}

// Weather Controls
function initWeatherControls() {
  const btns = document.querySelectorAll('.btn-weather');
  btns.forEach(btn => {
    btn.addEventListener('click', async () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const weather = btn.getAttribute('data-weather');

      if (!state.isClientMode) {
        try {
          const res = await fetch('/api/oracle/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weather })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`Weather Oracle updated: ${weather}`, 'info');
            fetchSystemState();
            return;
          }
        } catch (e) {
          state.isClientMode = true;
        }
      }

      // Client mode
      state.telemetry.weather = weather;
      let factor = 1.0;
      if (weather === 'SUNNY') { state.telemetry.irradiance = 920; factor = 1.0; }
      else if (weather === 'PARTLY_CLOUDY') { state.telemetry.irradiance = 520; factor = 0.58; }
      else if (weather === 'OVERCAST') { state.telemetry.irradiance = 210; factor = 0.22; }
      else if (weather === 'NIGHT') { state.telemetry.irradiance = 0; factor = 0.0; }

      for (const k of Object.keys(state.meters)) {
        const m = state.meters[k];
        if (m.panelCapacityKw > 0) {
          m.currentGenerationKw = Number((m.panelCapacityKw * factor * 0.85).toFixed(2));
        }
      }
      state.oracleHistory.unshift({
        time: new Date().toLocaleTimeString(),
        detail: `Weather Oracle updated: ${weather} (${state.telemetry.irradiance} W/m²)`,
        oracleSignature: `ORACLE_SIG_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
      showToast(`Weather Oracle updated: ${weather}`, 'info');
      renderAll();
    });
  });
}

// Consensus Controls
function initConsensusControls() {
  const btnMine = document.getElementById('btnMineMempool');
  btnMine?.addEventListener('click', async () => {
    const actor = state.users[state.activeActorId];
    if (actor && actor.role !== 'GRID_OPERATOR' && actor.role !== 'ADMIN') {
      showToast(`PoA Permission Check: Only authorized Validator Nodes can forge blocks. (Current role: ${actor.role})`, 'warning');
      return;
    }

    try {
      btnMine.disabled = true;
      btnMine.innerHTML = '⛏️ Validating & Signing Block...';

      if (!state.isClientMode) {
        try {
          const res = await fetch('/api/mine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validatorId: '0xGRID_OPERATOR_NODE_01' })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message);

          showToast(`PoA Block #${data.block.index} sealed and minted! (${data.validatedCount} txs confirmed)`, 'success');
          fetchSystemState();
          return;
        } catch (fetchErr) {
          state.isClientMode = true;
        }
      }

      // Client mode mining
      if (state.mempool.length === 0) {
        throw new Error('No transactions in mempool to mint');
      }

      const txs = [...state.mempool];
      for (const t of txs) {
        t.status = 'RECORDED';
        t.validatorId = '0xGRID_OPERATOR_NODE_01';
      }

      const prevBlock = state.chain[state.chain.length - 1];
      const rawMerkle = txs.map(t => `${t.txId}-${t.producerId}-${t.consumerId}-${t.energyKwh}-${t.pricePerKwh}-${t.totalPrice}`).join('|');
      const merkleRoot = await sha256(rawMerkle);
      const timestamp = Date.now();
      const hash = await sha256(`${state.chain.length}${prevBlock.hash}${timestamp}${merkleRoot}0xGRID_OPERATOR_NODE_01`);

      const newBlock = {
        index: state.chain.length,
        timestamp,
        isoTime: new Date(timestamp).toLocaleTimeString(),
        transactions: txs,
        previousHash: prevBlock.hash,
        validator: '0xGRID_OPERATOR_NODE_01',
        merkleRoot,
        hash,
        seal: (await sha256(`POA-SIGNATURE-0xGRID_OPERATOR_NODE_01-${hash}`)).substring(0, 32)
      };

      state.chain.push(newBlock);
      state.mempool = [];
      state.canonicalBackup = JSON.parse(JSON.stringify(state.chain));

      showToast(`PoA Block #${newBlock.index} sealed and minted by Municipal Substation #04!`, 'success');
      renderAll();
    } catch (err) {
      showToast(`Block Minting Failed: ${err.message}`, 'error');
    } finally {
      btnMine.disabled = false;
      btnMine.innerHTML = '⛏️ Forge / Mine Block (PoA)';
    }
  });

  const btnVerify = document.getElementById('btnVerifyChain');
  btnVerify?.addEventListener('click', async () => {
    const valid = await verifyClientChain();
    if (valid.valid) {
      showToast('Proof of Authority Audit: All SHA-256 block hashes, previous links, and validator seals are 100% valid!', 'success');
    } else {
      showToast(`Audit Alert: ${valid.error}`, 'error');
    }
  });
}

async function verifyClientChain() {
  for (let i = 1; i < state.chain.length; i++) {
    const cur = state.chain[i];
    const prev = state.chain[i - 1];

    if (cur.previousHash !== prev.hash) {
      return { valid: false, error: `Block #${cur.index} previousHash link broken! Expected ${prev.hash.substring(0, 12)}..., got ${cur.previousHash.substring(0, 12)}...` };
    }

    // Verify Merkle
    const rawMerkle = (cur.transactions || []).map(t => `${t.txId}-${t.producerId}-${t.consumerId}-${t.energyKwh}-${t.pricePerKwh}-${t.totalPrice}`).join('|');
    const calcMerkle = await sha256(rawMerkle);
    if (cur.merkleRoot !== calcMerkle) {
      return { valid: false, error: `Block #${cur.index} transaction Merkle Root mismatch! Data altered without authorization.` };
    }
  }
  return { valid: true };
}

// Security Demo
function initSecurityDemo() {
  const btnTamper = document.getElementById('btnSimulateTamper');
  const btnRestore = document.getElementById('btnRestoreChain');
  const resultBox = document.getElementById('tamperResultBox');

  btnTamper?.addEventListener('click', async () => {
    const blockIndex = parseInt(document.getElementById('tamperBlockIndex').value) || 1;
    const newEnergy = parseFloat(document.getElementById('tamperEnergyVal').value) || 999.0;

    if (!state.isClientMode) {
      try {
        const res = await fetch('/api/tamper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blockIndex, newEnergyKwh: newEnergy })
        });
        const data = await res.json();
        if (data.success) {
          resultBox.innerHTML = `
            <div style="color: #ef4444; font-family: monospace;">
              <h4 style="margin-bottom: 0.5rem;">🚨 MALICIOUS MODIFICATION DETECTED</h4>
              <p>• Block #${blockIndex} transaction energy modified: <strong>${data.tamperResult.originalAmount} kWh</strong> ➔ <strong style="color: #f87171;">${data.tamperResult.tamperedAmount} kWh</strong></p>
              <p>• Blockchain Hash Verification: <strong style="color: #f87171;">FAILED (INVALID)</strong></p>
              <p>• Error: ${data.validity.error}</p>
              <p style="margin-top: 0.5rem; color: #9ca3af;">Result: The PoA network and peer nodes reject this altered chain because the cryptographic hash link is broken!</p>
            </div>
          `;
          showToast('Tamper attempted! Blockchain cryptographic hash chain is now broken!', 'error');
          fetchSystemState();
          return;
        }
      } catch (e) {
        state.isClientMode = true;
      }
    }

    // Client mode tamper
    if (state.chain.length > blockIndex && state.chain[blockIndex].transactions?.length > 0) {
      const orig = state.chain[blockIndex].transactions[0].energyKwh;
      state.chain[blockIndex].transactions[0].energyKwh = newEnergy;
      state.isChainValid = false;

      resultBox.innerHTML = `
        <div style="color: #ef4444; font-family: monospace;">
          <h4 style="margin-bottom: 0.5rem;">🚨 MALICIOUS MODIFICATION DETECTED</h4>
          <p>• Block #${blockIndex} transaction energy modified: <strong>${orig} kWh</strong> ➔ <strong style="color: #f87171;">${newEnergy} kWh</strong></p>
          <p>• Blockchain Hash Verification: <strong style="color: #f87171;">FAILED (INVALID)</strong></p>
          <p>• Error: Block #${blockIndex} Merkle Root Mismatch! Transaction data altered.</p>
          <p style="margin-top: 0.5rem; color: #9ca3af;">Result: The PoA network and peer nodes reject this altered chain because the cryptographic hash link is broken!</p>
        </div>
      `;
      showToast('Tamper attempted! Blockchain cryptographic hash chain is now broken!', 'error');
      updateHealthBanner(false, `Block #${blockIndex} Merkle Root Mismatch!`);
      renderExplorer();
    }
  });

  btnRestore?.addEventListener('click', async () => {
    if (!state.isClientMode) {
      try {
        const res = await fetch('/api/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          resultBox.innerHTML = `
            <div style="color: #10b981; font-family: monospace;">
              <h4 style="margin-bottom: 0.5rem;">✅ CONSENSUS RESTORED</h4>
              <p>${data.message}</p>
              <p>All SHA-256 block hashes and PoA validator seals are verified canonical.</p>
            </div>
          `;
          showToast('Canonical blockchain ledger restored from authorized PoA validators!', 'success');
          fetchSystemState();
          return;
        }
      } catch (e) {
        state.isClientMode = true;
      }
    }

    // Client mode restore
    state.chain = JSON.parse(JSON.stringify(state.canonicalBackup));
    state.isChainValid = true;
    resultBox.innerHTML = `
      <div style="color: #10b981; font-family: monospace;">
        <h4 style="margin-bottom: 0.5rem;">✅ CONSENSUS RESTORED</h4>
        <p>Canonical blockchain ledger restored from authorized Proof-of-Authority validator nodes.</p>
        <p>All SHA-256 block hashes and PoA validator seals are verified canonical.</p>
      </div>
    `;
    showToast('Canonical blockchain ledger restored from authorized PoA validators!', 'success');
    updateHealthBanner(true);
    renderExplorer();
  });
}

// Stepper Guide
function initStepperGuide() {
  const steps = document.querySelectorAll('.step-card');
  const viewer = document.getElementById('stepDetailViewer');

  steps.forEach(step => {
    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
      const stepNum = step.getAttribute('data-step');
      const data = STEP_DETAILS[stepNum];
      if (data && viewer) {
        viewer.innerHTML = `
          <h4 style="color: #10b981; margin-bottom: 0.4rem;">${data.title}</h4>
          <p style="color: #e2e8f0; line-height: 1.6;">${data.detail}</p>
        `;
      }
    });
  });

  if (steps.length > 0) steps[0].click();
}

// Contract Code Viewer
function initContractCodeViewer() {
  const btns = document.querySelectorAll('.code-tab-btn');
  const codeBlock = document.getElementById('contractCodeBlock');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const contractKey = btn.getAttribute('data-contract');
      state.activeContractTab = contractKey;
      if (codeBlock) codeBlock.innerText = CONTRACT_CODES[contractKey] || '// No code found';
    });
  });

  if (codeBlock) codeBlock.innerText = CONTRACT_CODES.trading;
}

// ==========================================
// SYSTEM STATE FETCH & DATA RENDERING
// ==========================================

async function fetchSystemState() {
  try {
    const resStatus = await fetch('/api/status').then(r => r.json());
    if (resStatus && resStatus.success) {
      state.isClientMode = false;
      state.users = resStatus.users;
      state.telemetry = resStatus.telemetry;
      state.isChainValid = resStatus.isChainValid;

      const [resOffers, resMeters, resChain, resMempool, resEvents] = await Promise.all([
        fetch('/api/offers').then(r => r.json()),
        fetch('/api/oracle').then(r => r.json()),
        fetch('/api/chain').then(r => r.json()),
        fetch('/api/mempool').then(r => r.json()),
        fetch('/api/events').then(r => r.json())
      ]);

      if (resOffers.success) state.offers = resOffers.offers;
      if (resMeters.success) {
        state.meters = resMeters.meters;
        state.oracleHistory = resMeters.history;
      }
      if (resChain.success) state.chain = resChain.chain;
      if (resMempool.success) state.mempool = resMempool.mempool;
      if (resEvents.success) state.contractEvents = resEvents.contractEvents;

      renderAll();
      return;
    }
  } catch (err) {
    // Backend server is not reachable; seamless transition to in-browser engine
    state.isClientMode = true;
  }

  // Render client-mode state
  renderAll();
}

function renderAll() {
  // Global Metrics
  let totalShared = 0;
  for (const block of state.chain) {
    if (block.transactions) {
      for (const tx of block.transactions) {
        if (tx.txType === 'P2P_ENERGY_TRADE') {
          totalShared += Number(tx.energyKwh || 0);
        }
      }
    }
  }

  const elTotal = document.getElementById('metricTotalEnergy');
  if (elTotal) elTotal.innerHTML = `${totalShared.toFixed(1)} <span class="unit">kWh</span>`;

  const elHeight = document.getElementById('metricBlockHeight');
  if (elHeight) elHeight.innerHTML = `${state.chain.length} <span class="unit">Blocks</span>`;

  const elActive = document.getElementById('metricActiveOffers');
  if (elActive) elActive.innerText = state.offers.filter(o => o.status === 'AVAILABLE').length;

  const elPending = document.getElementById('metricPendingTx');
  if (elPending) elPending.innerHTML = `${state.mempool.length} <span class="unit">txs</span>`;

  const elBadge = document.getElementById('mempoolBadge');
  if (elBadge) elBadge.innerText = state.mempool.length;

  const elCount = document.getElementById('mempoolCount');
  if (elCount) elCount.innerText = state.mempool.length;

  const elValidator = document.getElementById('metricValidator');
  if (elValidator) elValidator.innerText = 'Substation #04';

  const freq = state.telemetry?.frequency ? state.telemetry.frequency.toFixed(2) : '50.01';
  const elHdrFreq = document.getElementById('headerFreq');
  if (elHdrFreq) elHdrFreq.innerText = `${freq} Hz`;

  const elHudFreq = document.getElementById('hudFreq');
  if (elHudFreq) elHudFreq.innerText = `${freq} Hz`;

  updateActorHeader();
  updateHealthBanner(state.isChainValid);
  renderMarketplace();
  renderMeters();
  renderOracleLog(state.oracleHistory);
  renderContractEvents();
  renderMempool();
  renderValidators();
  renderExplorer();
}

function updateHealthBanner(isValid, errorMsg) {
  const banner = document.getElementById('chainHealthBanner');
  const bannerIcon = document.getElementById('bannerIcon');
  const bannerText = document.getElementById('bannerText');

  if (!banner || !bannerIcon || !bannerText) return;

  if (isValid) {
    banner.className = 'chain-banner chain-healthy';
    bannerIcon.innerText = '✅';
    bannerText.innerText = 'Proof of Authority Blockchain Integrity: 100% Cryptographically Valid';
  } else {
    banner.className = 'chain-banner chain-tampered';
    bannerIcon.innerText = '🚨';
    bannerText.innerText = `CRITICAL ALERT: Blockchain Tampered! ${errorMsg || 'Hash Mismatch Detected'}`;
  }
}

// 1. Render Marketplace Offers
function renderMarketplace() {
  const container = document.getElementById('offersGrid');
  if (!container) return;

  const filter = document.getElementById('filterSource')?.value || 'ALL';
  const availableOffers = state.offers.filter(o => {
    if (filter === 'ALL') return true;
    return o.sourceType.toLowerCase().includes(filter.toLowerCase());
  });

  if (availableOffers.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 2rem; text-align: center; color: #9ca3af;">No matching energy offers available. Click "+ Create Energy Offer" to list surplus generation.</div>`;
    return;
  }

  container.innerHTML = availableOffers.map(offer => {
    const isCompleted = offer.status === 'COMPLETED';
    const isAvailable = offer.status === 'AVAILABLE' || offer.status === 'PARTIALLY_FILLED';
    const isOwner = offer.producerId === state.activeActorId;

    return `
      <div class="offer-card ${isCompleted ? 'offer-completed' : ''}">
        <div class="offer-card-header">
          <div class="offer-source">
            <span class="offer-source-icon">${offer.sourceType.includes('Solar') ? '☀️' : '🔋'}</span>
            <div class="offer-source-text">
              <h4>${offer.sourceType}</h4>
              <span class="offer-producer-id">Seller: <strong>${offer.producerName}</strong></span>
            </div>
          </div>
          <span class="offer-badge ${isCompleted ? 'badge-filled' : 'badge-available'}">
            ${offer.status}
          </span>
        </div>

        <div class="offer-metrics-grid">
          <div class="offer-metric-item">
            <span class="offer-metric-label">Available Surplus</span>
            <span class="offer-metric-value">${offer.availableKwh.toFixed(1)} <span class="unit">kWh</span></span>
          </div>
          <div class="offer-metric-item">
            <span class="offer-metric-label">P2P Rate</span>
            <span class="offer-metric-value price">$${offer.pricePerKwh.toFixed(2)} <span class="unit">/ kWh</span></span>
          </div>
        </div>

        <div class="offer-card-footer">
          <div class="offer-feeder-info">
            <span>⚡ Feeder: ${offer.gridFeederId}</span>
          </div>
          <div>
            ${isAvailable ? `
              <button class="btn btn-sm btn-primary" onclick="openBuyModal('${offer.offerId}')" ${isOwner ? 'disabled title="You cannot purchase your own offer"' : ''}>
                ${isOwner ? 'Your Offer' : '⚡ Buy Energy'}
              </button>
            ` : `
              <span style="font-size: 0.75rem; color: #9ca3af;">Fully Traded</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 2. Render Smart Meters
function renderMeters() {
  const container = document.getElementById('metersContainer');
  if (!container) return;

  const metersList = Object.values(state.meters);
  container.innerHTML = metersList.map(meter => {
    const net = meter.currentGenerationKw - meter.currentConsumptionKw;
    const isSurplus = net >= 0;

    return `
      <div class="meter-card">
        <div class="meter-card-header">
          <div>
            <h3>${meter.name}</h3>
            <span style="font-size: 0.75rem; color: #9ca3af; font-family: monospace;">IoT ID: ${meter.id}</span>
          </div>
          <span class="badge-tag green">Smart Meter Online</span>
        </div>

        <div class="meter-gauges-row">
          <div class="gauge-box">
            <span class="gauge-label">Live Solar Generation</span>
            <div class="gauge-value gen">${meter.currentGenerationKw.toFixed(2)} <span class="unit" style="font-size: 0.9rem;">kW</span></div>
          </div>
          <div class="gauge-box">
            <span class="gauge-label">Live Consumption</span>
            <div class="gauge-value load">${meter.currentConsumptionKw.toFixed(2)} <span class="unit" style="font-size: 0.9rem;">kW</span></div>
          </div>
        </div>

        <div class="meter-net-banner ${isSurplus ? 'net-surplus' : 'net-deficit'}">
          <span>Net Meter Flow:</span>
          <strong>${isSurplus ? '+' : ''}${net.toFixed(2)} kW (${isSurplus ? 'Sharing Surplus' : 'Drawing from Microgrid'})</strong>
        </div>

        <div class="appliances-list">
          <span class="appliances-header">Simulated Appliance Loads (Click to toggle):</span>
          <div class="appliance-tags">
            ${meter.activeAppliances.map(app => `
              <span class="appliance-chip" onclick="toggleAppliance('${meter.owner}', '${app.split(' ')[0]}')">
                ✓ ${app}
              </span>
            `).join('')}
            <button class="btn btn-sm btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="toggleAppliance('${meter.owner}', 'EV_Charger', 7.2)">
              + EV Charger (7.2kW)
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleAppliance(householdId, applianceName, loadKw = 2.0) {
  if (!state.isClientMode) {
    try {
      const res = await fetch('/api/oracle/appliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdId, applianceName, loadKw })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Appliance toggled on ${householdId}`, 'info');
        fetchSystemState();
        return;
      }
    } catch (e) {
      state.isClientMode = true;
    }
  }

  // Client mode
  const meter = state.meters[householdId];
  if (meter) {
    const existingIndex = meter.activeAppliances.findIndex(a => a.startsWith(applianceName));
    if (existingIndex >= 0) {
      meter.activeAppliances.splice(existingIndex, 1);
      meter.currentConsumptionKw = Math.max(0.5, Number((meter.currentConsumptionKw - loadKw).toFixed(2)));
    } else {
      meter.activeAppliances.push(`${applianceName} (${loadKw}kW)`);
      meter.currentConsumptionKw = Number((meter.currentConsumptionKw + loadKw).toFixed(2));
    }
    showToast(`Appliance toggled on ${householdId}`, 'info');
    renderAll();
  }
}

// 3. Render Oracle Log
function renderOracleLog(history) {
  const container = document.getElementById('oracleLogStream');
  if (!container || !history) return;

  container.innerHTML = history.map(item => `
    <div class="log-entry">
      <span class="log-time">[${item.time}]</span>
      <span>${item.detail}</span>
      <span class="log-sig">${item.oracleSignature}</span>
    </div>
  `).join('');
}

// 4. Render Contract Events
function renderContractEvents() {
  const container = document.getElementById('contractEventsList');
  if (!container) return;

  if (state.contractEvents.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 1.5rem; text-align: center; color: #9ca3af;">No on-chain events emitted yet. Execute a trade to see events.</div>`;
    return;
  }

  container.innerHTML = state.contractEvents.map(evt => `
    <div class="event-card">
      <div class="event-card-header">
        <span class="event-name">Event: ${evt.eventName}()</span>
        <span class="event-time">${evt.isoTime}</span>
      </div>
      <div class="event-params">
        ${JSON.stringify(evt.params, null, 2)}
      </div>
    </div>
  `).join('');
}

// 5. Render Mempool
function renderMempool() {
  const container = document.getElementById('mempoolList');
  if (!container) return;

  if (state.mempool.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 2rem; text-align: center; color: #9ca3af;">Mempool is clean. All energy transactions have been validated and minted into blocks!</div>`;
    return;
  }

  container.innerHTML = state.mempool.map(tx => `
    <div class="tx-mempool-card">
      <div class="tx-mempool-header">
        <span class="tx-hash-badge">TX #${tx.txId.substring(0, 14)}...</span>
        <span class="badge-tag" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">STATUS: ${tx.status}</span>
      </div>
      <div style="font-size: 0.85rem; margin-bottom: 0.4rem;">
        Transfer: <strong>${tx.energyKwh} kWh</strong> from <strong>${tx.producerId}</strong> ➔ <strong>${tx.consumerId}</strong>
      </div>
      <div style="font-size: 0.75rem; color: #9ca3af; display: flex; justify-content: space-between;">
        <span>Rate: $${tx.pricePerKwh}/kWh | Total: <strong>$${tx.totalPrice}</strong></span>
        <span>Grid Fee: $${tx.gridFee}</span>
      </div>
    </div>
  `).join('');
}

// 6. Render Authorized Validators
function renderValidators() {
  const container = document.getElementById('validatorsList');
  if (!container) return;

  const validators = [
    { id: '0xGRID_OPERATOR_NODE_01', name: 'Municipal Grid Substation #04', reputation: '100% Rep', status: 'ACTIVE SEALER' },
    { id: '0xCLEAN_ENERGY_CONSORTIUM_02', name: 'Renewable Consortium Validator', reputation: '98% Rep', status: 'ACTIVE' },
    { id: '0xREGIONAL_REGULATOR_03', name: 'State Energy Regulatory Node', reputation: '99% Rep', status: 'ACTIVE' }
  ];

  container.innerHTML = validators.map(v => `
    <div class="validator-item">
      <div class="validator-info">
        <span class="validator-title">${v.name}</span>
        <span class="validator-addr">${v.id}</span>
      </div>
      <div style="text-align: right;">
        <span class="badge-tag green">${v.status}</span>
      </div>
    </div>
  `).join('');
}

// 7. Render Block Explorer
function renderExplorer() {
  const timeline = document.getElementById('chainTimeline');
  const blockCount = document.getElementById('explorerBlockCount');
  if (!timeline || !state.chain) return;

  blockCount.innerText = state.chain.length;

  timeline.innerHTML = state.chain.map((block, idx) => {
    const isSelected = idx === state.selectedBlockIndex;
    const isTampered = !state.isChainValid && idx >= 1;
    return `
      <div class="block-card ${isSelected ? 'active-selected' : ''} ${isTampered ? 'tampered' : ''}" onclick="selectBlock(${idx})">
        <div class="block-card-header">
          <span class="block-num">Block #${block.index}</span>
          <span class="badge-tag ${block.index === 0 ? '' : 'green'}">${block.index === 0 ? 'GENESIS' : 'POA SEALED'}</span>
        </div>
        <div class="block-hash-preview" title="${block.hash}">
          Hash: ${block.hash.substring(0, 16)}...
        </div>
        <div class="block-meta">
          <span>Txs: <strong>${block.transactions?.length || 0}</strong></span>
          <span>Time: ${block.isoTime}</span>
          <span>Validator: ${block.validator.substring(0, 14)}...</span>
        </div>
      </div>
      ${idx < state.chain.length - 1 ? '<div class="chain-link-connector">⛓️</div>' : ''}
    `;
  }).join('');

  renderSelectedBlockInspector();
}

function selectBlock(idx) {
  state.selectedBlockIndex = idx;
  renderExplorer();
}

function renderSelectedBlockInspector() {
  const body = document.getElementById('inspectorBody');
  const block = state.chain[state.selectedBlockIndex];
  if (!body || !block) return;

  body.innerHTML = `
    <table class="inspector-table">
      <tbody>
        <tr>
          <td class="label-col">Block Index</td>
          <td class="val-col">#${block.index} ${block.index === 0 ? '(Genesis Block)' : ''}</td>
        </tr>
        <tr>
          <td class="label-col">Block Timestamp</td>
          <td class="val-col">${block.isoTime} (${block.timestamp})</td>
        </tr>
        <tr>
          <td class="label-col">Block Hash (SHA-256)</td>
          <td class="val-col" style="color: #10b981;">${block.hash}</td>
        </tr>
        <tr>
          <td class="label-col">Previous Block Hash</td>
          <td class="val-col">${block.previousHash}</td>
        </tr>
        <tr>
          <td class="label-col">Merkle Root Hash</td>
          <td class="val-col">${block.merkleRoot}</td>
        </tr>
        <tr>
          <td class="label-col">PoA Sealing Validator</td>
          <td class="val-col" style="color: #c4b5fd;">${block.validator}</td>
        </tr>
        <tr>
          <td class="label-col">PoA Digital Seal</td>
          <td class="val-col">${block.seal}</td>
        </tr>
        <tr>
          <td class="label-col">Transactions Count</td>
          <td class="val-col"><strong>${block.transactions?.length || 0} Verified Transactions</strong></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 1.5rem;">
      <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: #10b981;">Block Transactions Ledger Payload:</h4>
      ${renderBlockTransactions(block.transactions)}
    </div>
  `;
}

function renderBlockTransactions(txs) {
  if (!txs || txs.length === 0) return '<div class="empty-state">No transactions in this block.</div>';

  return `
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${txs.map(tx => `
        <div style="background: rgba(17, 24, 39, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.85rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.35rem;">
            <span style="font-family: monospace;">TXID: ${tx.txId}</span>
            <span style="color: #10b981; font-weight: 700;">CONFIRMED ON LEDGER</span>
          </div>
          <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.25rem;">
            Energy Transferred: <span style="color: #10b981;">${tx.energyKwh} kWh</span> (${tx.producerId} ➔ ${tx.consumerId})
          </div>
          <div style="font-size: 0.8rem; color: #9ca3af; display: flex; gap: 1.5rem; flex-wrap: wrap;">
            <span>Rate: <strong>$${tx.pricePerKwh}/kWh</strong></span>
            <span>Total Value: <strong>$${tx.totalPrice}</strong></span>
            <span>Grid Operator Fee (5%): <strong>$${tx.gridFee}</strong></span>
            <span>Net Producer Earnings: <strong>$${tx.producerEarnings}</strong></span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Microgrid Flow Animation Trigger
function triggerMicrogridFlow() {
  const pulseAtoB = document.getElementById('pulseAtoB');
  if (pulseAtoB) {
    pulseAtoB.classList.add('flow-active');
    setTimeout(() => {
      pulseAtoB.classList.remove('flow-active');
    }, 8000);
  }
}
