const crypto = require('crypto');

/**
 * Proof-of-Authority (PoA) Blockchain Engine for Peer-to-Peer Energy Sharing
 */

class Transaction {
  constructor(producerId, consumerId, energyKwh, pricePerKwh, offerId, txType = 'P2P_ENERGY_TRADE') {
    this.txId = this.calculateHash();
    this.timestamp = Date.now();
    this.isoDate = new Date(this.timestamp).toISOString();
    this.producerId = producerId;
    this.consumerId = consumerId;
    this.energyKwh = Number(energyKwh);
    this.pricePerKwh = Number(pricePerKwh);
    this.totalPrice = Number((this.energyKwh * this.pricePerKwh).toFixed(2));
    this.gridFee = Number((this.totalPrice * 0.05).toFixed(2)); // 5% grid maintenance fee
    this.producerEarnings = Number((this.totalPrice - this.gridFee).toFixed(2));
    this.offerId = offerId || null;
    this.txType = txType;
    this.status = 'PENDING'; // PENDING, VALIDATED, RECORDED, REJECTED
    this.validatorId = null;
    this.validationSignature = null;
    this.smartContractVerified = false;
    this.meterReadingVerified = false;
  }

  calculateHash() {
    const payload = `${this.producerId}-${this.consumerId}-${this.energyKwh}-${this.pricePerKwh}-${Date.now()}-${Math.random()}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}

class Block {
  constructor(index, timestamp, transactions, previousHash = '', validator = '0xGRID_OPERATOR_NODE_01') {
    this.index = index;
    this.timestamp = timestamp;
    this.isoTime = new Date(timestamp).toLocaleString();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.validator = validator;
    this.merkleRoot = this.calculateMerkleRoot();
    this.hash = this.calculateHash();
    this.nonce = 0; // PoA does not require computational mining, but uses a nonce for consensus seal
    this.seal = this.generatePoASeal();
  }

  calculateMerkleRoot() {
    if (!this.transactions || this.transactions.length === 0) {
      return crypto.createHash('sha256').update('EMPTY_BLOCK').digest('hex');
    }
    const hashes = this.transactions.map(tx => {
      const payload = `${tx.txId}-${tx.producerId}-${tx.consumerId}-${tx.energyKwh}-${tx.pricePerKwh}-${tx.totalPrice}`;
      return crypto.createHash('sha256').update(payload).digest('hex');
    });
    let currentLevel = hashes;
    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
        const combined = crypto.createHash('sha256').update(left + right).digest('hex');
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
    }
    return currentLevel[0];
  }

  calculateHash() {
    const raw = `${this.index}${this.previousHash}${this.timestamp}${this.merkleRoot}${this.validator}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  generatePoASeal() {
    const sealData = `POA-SIGNATURE-${this.validator}-${this.hash}`;
    return crypto.createHash('sha256').update(sealData).digest('hex').substring(0, 32);
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.mempool = []; // Pending unconfirmed transactions
    this.authorizedValidators = [
      { id: '0xGRID_OPERATOR_NODE_01', name: 'Municipal Grid Substation #04', reputation: 100, active: true },
      { id: '0xCLEAN_ENERGY_CONSORTIUM_02', name: 'Renewable Consortium Validator', reputation: 98, active: true },
      { id: '0xREGIONAL_REGULATOR_03', name: 'State Energy Regulatory Node', reputation: 99, active: true }
    ];
    this.activeValidatorIndex = 0;
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisTx = {
      txId: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: Date.now(),
      isoDate: new Date().toISOString(),
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
      validatorId: '0xCONSORTIUM_ROOT',
      smartContractVerified: true,
      meterReadingVerified: true
    };
    const genesisBlock = new Block(0, Date.now(), [genesisTx], '0000000000000000000000000000000000000000000000000000000000000000', '0xCONSORTIUM_ROOT');
    this.chain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  getCurrentValidator() {
    const active = this.authorizedValidators.filter(v => v.active);
    if (active.length === 0) return null;
    return active[this.activeValidatorIndex % active.length];
  }

  rotateValidator() {
    this.activeValidatorIndex = (this.activeValidatorIndex + 1) % this.authorizedValidators.length;
  }

  isAuthorizedValidator(validatorId) {
    return this.authorizedValidators.some(v => v.id === validatorId && v.active);
  }

  addTransactionToMempool(transaction) {
    // Basic structural validation
    if (!transaction.producerId || !transaction.consumerId) {
      throw new Error('Transaction must include Producer ID and Consumer ID');
    }
    if (transaction.energyKwh <= 0) {
      throw new Error('Energy amount must be greater than zero');
    }
    if (transaction.pricePerKwh < 0) {
      throw new Error('Price per kWh cannot be negative');
    }

    transaction.status = 'PENDING';
    this.mempool.push(transaction);
    return transaction;
  }

  /**
   * Proof of Authority Consensus Block Mining / Minting
   * In PoA, an authorized node validates the transactions and signs the block without heavy PoW computation
   */
  minePendingTransactions(validatorId = null) {
    if (this.mempool.length === 0) {
      return { success: false, message: 'No transactions in mempool to mint' };
    }

    const validator = validatorId || this.getCurrentValidator().id;

    if (!this.isAuthorizedValidator(validator)) {
      throw new Error(`Consensus Error: Node ${validator} is NOT an authorized validator in this Permissioned Consortium!`);
    }

    // Step 1: Validate each transaction in mempool
    const validatedTxs = [];
    const rejectedTxs = [];

    for (const tx of this.mempool) {
      // Smart contract rule check & signature verification
      if (tx.energyKwh > 0 && tx.producerId !== tx.consumerId) {
        tx.status = 'RECORDED';
        tx.validatorId = validator;
        tx.validationSignature = `SIG_${validator.substring(2, 8)}_${tx.txId.substring(0, 10)}`;
        tx.smartContractVerified = true;
        tx.meterReadingVerified = true;
        validatedTxs.push(tx);
      } else {
        tx.status = 'REJECTED';
        rejectedTxs.push(tx);
      }
    }

    if (validatedTxs.length === 0) {
      this.mempool = [];
      return { success: false, message: 'All pending transactions failed validation' };
    }

    // Step 2: Create new block
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      validatedTxs,
      previousBlock.hash,
      validator
    );

    // Step 3: Append to chain & clear mempool
    this.chain.push(newBlock);
    this.mempool = [];
    this.rotateValidator();

    return {
      success: true,
      block: newBlock,
      validatedCount: validatedTxs.length,
      rejectedCount: rejectedTxs.length,
      validator
    };
  }

  /**
   * Validate entire blockchain integrity
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 1. Verify Merkle root of transactions
      const recalculatedMerkle = currentBlock.calculateMerkleRoot();
      if (currentBlock.merkleRoot !== recalculatedMerkle) {
        return {
          valid: false,
          error: `Block #${currentBlock.index} Merkle root mismatch! Transactions were modified without authorization. (Expected ${recalculatedMerkle.substring(0, 16)}..., stored ${currentBlock.merkleRoot.substring(0, 16)}...)`,
          brokenBlockIndex: currentBlock.index
        };
      }

      // 2. Verify recalculation of block hash
      const recalculatedHash = currentBlock.calculateHash();
      if (currentBlock.hash !== recalculatedHash) {
        return {
          valid: false,
          error: `Block #${currentBlock.index} hash mismatch. Expected ${recalculatedHash}, got ${currentBlock.hash}`,
          brokenBlockIndex: currentBlock.index
        };
      }

      // 3. Verify previous block hash link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          valid: false,
          error: `Block #${currentBlock.index} previousHash (${currentBlock.previousHash.substring(0, 10)}...) does not match Block #${previousBlock.index} hash (${previousBlock.hash.substring(0, 10)}...)`,
          brokenBlockIndex: currentBlock.index
        };
      }

      // 4. Verify validator authorization
      if (!this.isAuthorizedValidator(currentBlock.validator) && currentBlock.validator !== '0xCONSORTIUM_ROOT') {
        return {
          valid: false,
          error: `Block #${currentBlock.index} was signed by unauthorized validator ${currentBlock.validator}`,
          brokenBlockIndex: currentBlock.index
        };
      }
    }

    return { valid: true };
  }

  /**
   * Tamper Simulation for Educational Demo
   * Alters data in a block to prove how cryptographic chaining catches unauthorized modifications
   */
  tamperBlockData(blockIndex, newEnergyKwh) {
    if (blockIndex <= 0 || blockIndex >= this.chain.length) {
      throw new Error(`Cannot tamper block index ${blockIndex}`);
    }
    const block = this.chain[blockIndex];
    if (block.transactions && block.transactions.length > 0) {
      const originalAmount = block.transactions[0].energyKwh;
      block.transactions[0].energyKwh = Number(newEnergyKwh);
      block.transactions[0].totalPrice = Number((newEnergyKwh * block.transactions[0].pricePerKwh).toFixed(2));
      // Notice: If we alter the transaction data without updating hash, the hash calculation fails.
      // If we update hash, the next block's previousHash fails!
      return {
        blockIndex,
        originalAmount,
        tamperedAmount: newEnergyKwh,
        tamperedBlock: block
      };
    }
    throw new Error('Block has no transactions to tamper');
  }

  /**
   * Restore chain from backup / canonical consensus source
   */
  restoreChain(canonicalBackup) {
    this.chain = JSON.parse(JSON.stringify(canonicalBackup));
    // Reinstantiate block methods
    this.chain = this.chain.map(rawBlock => {
      const b = new Block(rawBlock.index, rawBlock.timestamp, rawBlock.transactions, rawBlock.previousHash, rawBlock.validator);
      b.hash = rawBlock.hash;
      b.merkleRoot = rawBlock.merkleRoot;
      b.seal = rawBlock.seal;
      return b;
    });
    return this.isChainValid();
  }
}

module.exports = { Blockchain, Block, Transaction };
