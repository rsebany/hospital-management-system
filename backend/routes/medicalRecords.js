const express = require('express');
const router = express.Router();

// Example: GET /api/v1/medicalRecords/health
router.get('/health', (req, res) => {
  res.json({ status: 'medical records route OK' });
});

module.exports = router; 