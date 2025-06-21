const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { body } = require('express-validator');
const aiAppointmentController = require('../controllers/aiController');

// Example: GET /api/v1/appointments/health
router.get('/health', (req, res) => {
  res.json({ status: 'appointments route OK' });
});

// AI-powered appointment suggestion
router.post('/ai/appointments/suggest',
  authenticateToken,
  [
    body('patientId').isString().notEmpty().withMessage('Patient ID is required'),
    body('doctorId').isString().notEmpty().withMessage('Doctor ID is required'),
    body('preferredDates').isArray({ min: 1 }).withMessage('At least one preferred date is required'),
    body('timeRange').isObject().withMessage('Time range is required'),
    body('constraints').optional().isObject()
  ],
  validateRequest,
  aiAppointmentController.suggestAppointmentSlots
);

module.exports = router; 