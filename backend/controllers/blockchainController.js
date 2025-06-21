const blockchainService = require('../services/blockchainService');
const MedicalRecord = require('../models/MedicalRecord');
const logger = require('../utils/logger');

class BlockchainController {
  /**
   * Verify medical record integrity on blockchain
   * GET /api/v1/blockchain/verify/:recordId
   */
  async verifyRecord(req, res) {
    try {
      const { recordId } = req.params;
      
      // Get medical record from database
      const medicalRecord = await MedicalRecord.findById(recordId);
      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found'
        });
      }

      // Verify record hash on blockchain
      const verification = await blockchainService.verifyRecordHash(medicalRecord.recordHash);
      
      // Check if database hash matches blockchain
      const currentHash = blockchainService.generateRecordHash({
        patientId: medicalRecord.patientId,
        doctorId: medicalRecord.doctorId,
        recordType: medicalRecord.recordType,
        data: medicalRecord.data,
        version: medicalRecord.version,
        createdAt: medicalRecord.createdAt
      });

      const integrityCheck = currentHash === medicalRecord.recordHash;

      res.status(200).json({
        success: true,
        recordId,
        verification: {
          ...verification,
          integrityCheck,
          currentHash,
          storedHash: medicalRecord.recordHash
        },
        blockchainInfo: {
          transactionHash: medicalRecord.blockchainTransactionHash,
          blockNumber: medicalRecord.blockchainBlockNumber
        }
      });
    } catch (error) {
      logger.error('Error verifying medical record on blockchain:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify medical record',
        message: error.message
      });
    }
  }

  /**
   * Get audit trail for a medical record
   * GET /api/v1/blockchain/audit/:recordId
   */
  async getAuditTrail(req, res) {
    try {
      const { recordId } = req.params;
      
      // Get medical record from database
      const medicalRecord = await MedicalRecord.findById(recordId);
      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found'
        });
      }

      // Get audit trail from blockchain
      const auditTrail = await blockchainService.getAuditTrail(medicalRecord.recordHash);
      
      // Get transaction details if available
      let transactionDetails = null;
      if (medicalRecord.blockchainTransactionHash) {
        try {
          transactionDetails = await blockchainService.getTransactionDetails(
            medicalRecord.blockchainTransactionHash
          );
        } catch (error) {
          logger.warn('Could not get transaction details:', error.message);
        }
      }

      res.status(200).json({
        success: true,
        recordId,
        auditTrail: {
          ...auditTrail,
          transactionDetails
        }
      });
    } catch (error) {
      logger.error('Error getting audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get audit trail',
        message: error.message
      });
    }
  }

  /**
   * Check blockchain connection status
   * GET /api/v1/blockchain/status
   */
  async getBlockchainStatus(req, res) {
    try {
      const status = await blockchainService.checkConnection();
      
      res.status(200).json({
        success: true,
        blockchain: status
      });
    } catch (error) {
      logger.error('Error checking blockchain status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check blockchain status',
        message: error.message
      });
    }
  }

  /**
   * Get all medical records for a patient with blockchain verification
   * GET /api/v1/blockchain/patient/:patientId
   */
  async getPatientRecords(req, res) {
    try {
      const { patientId } = req.params;
      
      // Get all medical records for the patient
      const medicalRecords = await MedicalRecord.find({ 
        patientId, 
        isActive: true 
      }).sort({ createdAt: -1 });

      // Verify each record on blockchain
      const verifiedRecords = await Promise.all(
        medicalRecords.map(async (record) => {
          const verification = await blockchainService.verifyRecordHash(record.recordHash);
          return {
            _id: record._id,
            recordType: record.recordType,
            version: record.version,
            createdAt: record.createdAt,
            blockchainVerification: verification,
            blockchainInfo: {
              transactionHash: record.blockchainTransactionHash,
              blockNumber: record.blockchainBlockNumber
            }
          };
        })
      );

      res.status(200).json({
        success: true,
        patientId,
        records: verifiedRecords
      });
    } catch (error) {
      logger.error('Error getting patient records with blockchain verification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get patient records',
        message: error.message
      });
    }
  }

  /**
   * Manually store a record hash on blockchain (for testing/backup)
   * POST /api/v1/blockchain/store/:recordId
   */
  async storeRecordHash(req, res) {
    try {
      const { recordId } = req.params;
      
      // Get medical record from database
      const medicalRecord = await MedicalRecord.findById(recordId);
      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found'
        });
      }

      // Generate hash if not exists
      if (!medicalRecord.recordHash) {
        const recordHash = blockchainService.generateRecordHash({
          patientId: medicalRecord.patientId,
          doctorId: medicalRecord.doctorId,
          recordType: medicalRecord.recordType,
          data: medicalRecord.data,
          version: medicalRecord.version,
          createdAt: medicalRecord.createdAt
        });

        medicalRecord.recordHash = recordHash;
      }

      // Store hash on blockchain
      const blockchainResult = await blockchainService.storeRecordHash(medicalRecord.recordHash);
      
      // Update medical record with blockchain info
      medicalRecord.blockchainTransactionHash = blockchainResult.transactionHash;
      medicalRecord.blockchainBlockNumber = blockchainResult.blockNumber;
      await medicalRecord.save();

      res.status(200).json({
        success: true,
        recordId,
        blockchainResult,
        message: 'Record hash stored on blockchain successfully'
      });
    } catch (error) {
      logger.error('Error storing record hash on blockchain:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to store record hash on blockchain',
        message: error.message
      });
    }
  }
}

module.exports = new BlockchainController(); 