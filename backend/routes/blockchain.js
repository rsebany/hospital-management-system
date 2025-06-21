const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { param } = require('express-validator');
const blockchainController = require('../controllers/blockchainController');

// Check blockchain connection status
router.get('/status', blockchainController.getBlockchainStatus);

// Verify medical record integrity on blockchain
router.get('/verify/:recordId',
  authenticateToken,
  [param('recordId').isMongoId().withMessage('Valid record ID is required')],
  validateRequest,
  blockchainController.verifyRecord
);

// Get audit trail for a medical record
router.get('/audit/:recordId',
  authenticateToken,
  [param('recordId').isMongoId().withMessage('Valid record ID is required')],
  validateRequest,
  blockchainController.getAuditTrail
);

// Get all medical records for a patient with blockchain verification
router.get('/patient/:patientId',
  authenticateToken,
  [param('patientId').isMongoId().withMessage('Valid patient ID is required')],
  validateRequest,
  blockchainController.getPatientRecords
);

// Manually store a record hash on blockchain (for testing/backup)
router.post('/store/:recordId',
  authenticateToken,
  [param('recordId').isMongoId().withMessage('Valid record ID is required')],
  validateRequest,
  blockchainController.storeRecordHash
);

module.exports = router; 