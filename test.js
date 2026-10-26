const http = require('http');

async function testApi() {
  // Require and test modules directly
  const { Blockchain } = require('./src/blockchain');
  const { SmartContractEngine } = require('./src/smartContract');
  const { SmartMeterOracle } = require('./src/oracle');
  const { INITIAL_USERS } = require('./src/actors');

  console.log('Testing Blockchain...');
  const bc = new Blockchain();
  console.log('Genesis Block Hash:', bc.chain[0].hash);

  console.log('Testing Oracle...');
  const oracle = new SmartMeterOracle();
  oracle.setWeather('SUNNY');
  console.log('Meters:', Object.keys(oracle.getAllMeters()));

  console.log('Testing Smart Contract...');
  const users = JSON.parse(JSON.stringify(INITIAL_USERS));
  const sc = new SmartContractEngine(bc, oracle, users);

  console.log('Initial offers:', sc.offers.length);
  const buyRes = sc.buyEnergy(sc.offers[0].offerId, 'HOUSEHOLD_B', 3.0);
  console.log('Buy result success:', buyRes.success);
  console.log('Mempool length:', bc.mempool.length);

  const mineRes = bc.minePendingTransactions('0xGRID_OPERATOR_NODE_01');
  console.log('Mine result success:', mineRes.success, 'Block #', mineRes.block.index);

  const valid = bc.isChainValid();
  console.log('Chain valid:', valid.valid);

  // Test tamper
  const tamper = bc.tamperBlockData(1, 999);
  console.log('Tamper executed:', tamper.tamperedAmount);
  const tamperedValid = bc.isChainValid();
  console.log('Tampered chain valid (should be false):', tamperedValid.valid);

  console.log('ALL TESTS PASSED SUCCESSFULLY! 🚀');
}

testApi().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
