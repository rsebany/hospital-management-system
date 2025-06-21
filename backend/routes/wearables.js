const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { body, param } = require('express-validator');
const wearableController = require('../controllers/wearableController');

// Ingest wearable data
router.post('/data',
  authenticateToken,
  [
    body('patientId').isString().notEmpty().withMessage('Patient ID is required'),
    body('deviceType').isString().notEmpty().withMessage('Device type is required'),
    body('timestamp').isISO8601().withMessage('Timestamp must be a valid ISO date'),
    body('data').isObject().withMessage('Data is required')
  ],
  validateRequest,
  wearableController.ingestData
);

// Get wearable data for a patient
router.get('/:patientId',
  authenticateToken,
  [param('patientId').isString().notEmpty().withMessage('Patient ID is required')],
  validateRequest,
  wearableController.getPatientData
);

module.exports = router; 