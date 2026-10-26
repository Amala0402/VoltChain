const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { Blockchain } = require('./src/blockchain');
const { SmartContractEngine } = require('./src/smartContract');
const { SmartMeterOracle } = require('./src/oracle');
const { INITIAL_USERS, hasPermission } = require('./src/actors');

// Initialize Core Subsystems
const blockchain = new Blockchain();
const oracle = new SmartMeterOracle();
let users = JSON.parse(JSON.stringify(INITIAL_USERS));
let smartContract = new SmartContractEngine(blockchain, oracle, users);

// Canonical snapshot for tamper demonstration restore
let canonicalChainBackup = JSON.parse(JSON.stringify(blockchain.chain));

// Seed with an initial sample transaction in Block #1 so the explorer has immediate rich data
try {
  const initialOffer = smartContract.offers[0];
  const initialBuy = smartContract.buyEnergy(initialOffer.offerId, 'HOUSEHOLD_B', 5.0);
  const mineResult = blockchain.minePendingTransactions('0xGRID_OPERATOR_NODE_01');
  canonicalChainBackup = JSON.parse(JSON.stringify(blockchain.chain));
} catch (e) {
  console.log('Seed initialization info:', e.message);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // ==========================================
  // API ROUTING
  // ==========================================

  if (pathname.startsWith('/api/')) {
    try {
      // 1. GET /api/status - System overview
      if (pathname === '/api/status' && method === 'GET') {
        const validation = blockchain.isChainValid();
        const telemetry = oracle.getGridTelemetry();
        return sendJson(res, 200, {
          success: true,
          blockHeight: blockchain.chain.length,
          latestBlockHash: blockchain.getLatestBlock().hash,
          isChainValid: validation.valid,
          validationError: validation.error || null,
          brokenBlockIndex: validation.brokenBlockIndex || null,
          pendingTransactionsCount: blockchain.mempool.length,
          activeValidator: blockchain.getCurrentValidator(),
          authorizedValidators: blockchain.authorizedValidators,
          activeOffersCount: smartContract.offers.filter(o => o.status === 'AVAILABLE').length,
          telemetry,
          users
        });
      }

      // 2. GET /api/chain - Full Ledger
      if (pathname === '/api/chain' && method === 'GET') {
        const validation = blockchain.isChainValid();
        return sendJson(res, 200, {
          success: true,
          chain: blockchain.chain,
          isValid: validation.valid,
          error: validation.error || null,
          brokenBlockIndex: validation.brokenBlockIndex || null
        });
      }

      // 3. GET /api/mempool - Pending transactions
      if (pathname === '/api/mempool' && method === 'GET') {
        return sendJson(res, 200, {
          success: true,
          mempool: blockchain.mempool,
          count: blockchain.mempool.length
        });
      }

      // 4. GET /api/offers - Available energy offers
      if (pathname === '/api/offers' && method === 'GET') {
        return sendJson(res, 200, {
          success: true,
          offers: smartContract.getEnergyOffers()
        });
      }

      // 5. POST /api/offers - Create energy offer
      if (pathname === '/api/offers' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { producerId, energyKwh, pricePerKwh, sourceType } = body;
        const result = smartContract.createEnergyOffer(producerId, energyKwh, pricePerKwh, sourceType);
        return sendJson(res, 200, result);
      }

      // 6. POST /api/buy - Buy energy via Smart Contract
      if (pathname === '/api/buy' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { offerId, consumerId, requestedKwh } = body;
        const result = smartContract.buyEnergy(offerId, consumerId, requestedKwh);
        return sendJson(res, 200, result);
      }

      // 7. POST /api/mine - PoA Consensus Block Mining
      if (pathname === '/api/mine' && method === 'POST') {
        const body = await parseJsonBody(req);
        const validatorId = body.validatorId || '0xGRID_OPERATOR_NODE_01';
        const result = blockchain.minePendingTransactions(validatorId);
        if (result.success) {
          // Update backup if legitimate
          canonicalChainBackup = JSON.parse(JSON.stringify(blockchain.chain));
        }
        return sendJson(res, 200, result);
      }

      // 8. GET /api/oracle - Smart meters and telemetry
      if (pathname === '/api/oracle' && method === 'GET') {
        return sendJson(res, 200, {
          success: true,
          meters: oracle.getAllMeters(),
          telemetry: oracle.getGridTelemetry(),
          history: oracle.oracleUpdateHistory
        });
      }

      // 9. POST /api/oracle/weather - Update weather condition
      if (pathname === '/api/oracle/weather' && method === 'POST') {
        const body = await parseJsonBody(req);
        oracle.setWeather(body.weather || 'SUNNY');
        return sendJson(res, 200, {
          success: true,
          meters: oracle.getAllMeters(),
          telemetry: oracle.getGridTelemetry()
        });
      }

      // 10. POST /api/oracle/appliance - Toggle appliance
      if (pathname === '/api/oracle/appliance' && method === 'POST') {
        const body = await parseJsonBody(req);
        oracle.toggleApplianceLoad(body.householdId, body.applianceName, body.loadKw);
        return sendJson(res, 200, {
          success: true,
          meters: oracle.getAllMeters()
        });
      }

      // 11. POST /api/tamper - Tamper simulation
      if (pathname === '/api/tamper' && method === 'POST') {
        const body = await parseJsonBody(req);
        const blockIndex = Number(body.blockIndex || 1);
        const newEnergy = Number(body.newEnergyKwh || 999.0);
        const tamperResult = blockchain.tamperBlockData(blockIndex, newEnergy);
        const validity = blockchain.isChainValid();
        return sendJson(res, 200, {
          success: true,
          message: 'Tamper attempted! Block transaction data modified.',
          tamperResult,
          validity
        });
      }

      // 12. POST /api/restore - Restore canonical ledger
      if (pathname === '/api/restore' && method === 'POST') {
        blockchain.restoreChain(canonicalChainBackup);
        const validity = blockchain.isChainValid();
        return sendJson(res, 200, {
          success: true,
          message: 'Canonical blockchain ledger restored from authorized Proof-of-Authority validator nodes.',
          validity
        });
      }

      // 13. GET /api/events - Smart contract & audit logs
      if (pathname === '/api/events' && method === 'GET') {
        return sendJson(res, 200, {
          success: true,
          contractEvents: smartContract.events,
          oracleEvents: oracle.oracleUpdateHistory
        });
      }

      // 14. POST /api/reset - Reset everything to factory demo state
      if (pathname === '/api/reset' && method === 'POST') {
        users = JSON.parse(JSON.stringify(INITIAL_USERS));
        const newChain = new Blockchain();
        const newOracle = new SmartMeterOracle();
        const newContract = new SmartContractEngine(newChain, newOracle, users);
        
        blockchain.chain = newChain.chain;
        blockchain.mempool = [];
        Object.assign(oracle, newOracle);
        Object.assign(smartContract, newContract);
        
        canonicalChainBackup = JSON.parse(JSON.stringify(blockchain.chain));
        return sendJson(res, 200, { success: true, message: 'System state reset to clean demo defaults.' });
      }

      return sendJson(res, 404, { success: false, error: 'Endpoint not found' });
    } catch (err) {
      console.error('API Error:', err.message);
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================

  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA client navigation
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err2, fallbackContent) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fallbackContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ BLOCKCHAIN ENERGY SHARING PLATFORM (P2P MICROGRID) ⚡`);
  console.log(`======================================================`);
  console.log(`🚀 Web Application Server running at: http://localhost:${PORT}`);
  console.log(`🔒 Consensus Engine: Proof of Authority (PoA)`);
  console.log(`📜 Smart Contracts: EnergyTrading, TxManager, PaymentEscrow`);
  console.log(`🛰️ Oracle Service: Smart Meter IoT Simulator Connected`);
  console.log(`======================================================\n`);
});
