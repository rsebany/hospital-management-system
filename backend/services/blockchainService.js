const { Web3 } = require('web3');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

class BlockchainService {
  constructor() {
    // Check if blockchain environment variables are set
    this.isEnabled = !!(process.env.BLOCKCHAIN_NODE_URL && 
                       process.env.BLOCKCHAIN_CONTRACT_ADDRESS && 
                       process.env.BLOCKCHAIN_ADMIN_ADDRESS && 
                       process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY);

    if (this.isEnabled) {
      try {
        // Initialize Web3 connection
        this.web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL);
        
        // Contract ABI for medical records (simplified)
        this.contractABI = [
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "recordHash",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              }
            ],
            "name": "storeRecordHash",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "recordHash",
                "type": "string"
              }
            ],
            "name": "verifyRecordHash",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ];
        
        // Validate Ethereum addresses in development mode
        if (process.env.NODE_ENV === 'development') {
          // Check if addresses are valid Ethereum addresses (42 characters starting with 0x)
          const isValidAddress = (address) => {
            return address && address.length === 42 && address.startsWith('0x');
          };
          
          if (!isValidAddress(process.env.BLOCKCHAIN_CONTRACT_ADDRESS) || 
              !isValidAddress(process.env.BLOCKCHAIN_ADMIN_ADDRESS)) {
            logger.warn('⚠️ Invalid Ethereum addresses in development mode, disabling blockchain service');
            this.isEnabled = false;
            return;
          }
        }
        
        // Initialize contract
        this.contract = new this.web3.eth.Contract(
          this.contractABI,
          process.env.BLOCKCHAIN_CONTRACT_ADDRESS
        );
        
        // Admin account for transactions
        this.adminAccount = process.env.BLOCKCHAIN_ADMIN_ADDRESS;
        this.adminPrivateKey = process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY;
        
        logger.info('Blockchain service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize blockchain service:', error);
        if (process.env.NODE_ENV === 'development') {
          logger.warn('⚠️ Continuing in development mode without blockchain service');
          this.isEnabled = false;
        } else {
          throw error;
        }
      }
    } else {
      logger.info('Blockchain service disabled - missing environment variables');
    }
  }

  /**
   * Generate hash for medical record
   */
  generateRecordHash(recordData) {
    try {
      const recordString = JSON.stringify(recordData, Object.keys(recordData).sort());
      return crypto.createHash('sha256').update(recordString).digest('hex');
    } catch (error) {
      logger.error('Error generating record hash:', error);
      throw new Error('Failed to generate record hash');
    }
  }

  /**
   * Store record hash on blockchain
   */
  async storeRecordHash(recordHash, metadata = {}) {
    if (!this.isEnabled) {
      throw new Error('Blockchain service is not enabled');
    }
    
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create transaction
      const transaction = {
        from: this.adminAccount,
        to: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
        gas: 200000,
        gasPrice: await this.web3.eth.getGasPrice(),
        data: this.contract.methods.storeRecordHash(recordHash, timestamp).encodeABI()
      };

      // Sign and send transaction
      const signedTx = await this.web3.eth.accounts.signTransaction(transaction, this.adminPrivateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      logger.info('Record hash stored on blockchain', {
        recordHash,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp
      };
    } catch (error) {
      logger.error('Error storing record hash on blockchain:', error);
      throw new Error('Failed to store record hash on blockchain');
    }
  }

  /**
   * Verify record hash on blockchain
   */
  async verifyRecordHash(recordHash) {
    if (!this.isEnabled) {
      return {
        exists: false,
        timestamp: 0,
        verified: false,
        error: 'Blockchain service is not enabled'
      };
    }
    
    try {
      const result = await this.contract.methods.verifyRecordHash(recordHash).call();
      
      return {
        exists: result[0],
        timestamp: result[1],
        verified: true
      };
    } catch (error) {
      logger.error('Error verifying record hash on blockchain:', error);
      return {
        exists: false,
        timestamp: 0,
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Get blockchain transaction details
   */
  async getTransactionDetails(transactionHash) {
    try {
      const transaction = await this.web3.eth.getTransaction(transactionHash);
      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      
      return {
        transactionHash,
        blockNumber: transaction.blockNumber,
        from: transaction.from,
        to: transaction.to,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        timestamp: await this.getBlockTimestamp(transaction.blockNumber)
      };
    } catch (error) {
      logger.error('Error getting transaction details:', error);
      throw new Error('Failed to get transaction details');
    }
  }

  /**
   * Get block timestamp
   */
  async getBlockTimestamp(blockNumber) {
    try {
      const block = await this.web3.eth.getBlock(blockNumber);
      return block.timestamp;
    } catch (error) {
      logger.error('Error getting block timestamp:', error);
      return null;
    }
  }

  /**
   * Check blockchain connection
   */
  async checkConnection() {
    if (!this.isEnabled) {
      return {
        connected: false,
        error: 'Blockchain service is not enabled'
      };
    }
    
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      const networkId = await this.web3.eth.net.getId();
      
      return {
        connected: true,
        blockNumber,
        networkId,
        nodeUrl: process.env.BLOCKCHAIN_NODE_URL
      };
    } catch (error) {
      logger.error('Blockchain connection check failed:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Get audit trail for a record
   */
  async getAuditTrail(recordHash) {
    try {
      const verification = await this.verifyRecordHash(recordHash);
      
      if (!verification.exists) {
        return {
          recordHash,
          exists: false,
          auditTrail: []
        };
      }

      // In a real implementation, you would query blockchain events
      // For now, return basic verification info
      return {
        recordHash,
        exists: true,
        timestamp: verification.timestamp,
        auditTrail: [
          {
            action: 'record_created',
            timestamp: verification.timestamp,
            blockNumber: 'N/A', // Would be available in real implementation
            transactionHash: 'N/A' // Would be available in real implementation
          }
        ]
      };
    } catch (error) {
      logger.error('Error getting audit trail:', error);
      throw new Error('Failed to get audit trail');
    }
  }
}

module.exports = new BlockchainService(); 