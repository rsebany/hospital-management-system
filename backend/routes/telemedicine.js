const express = require('express');
const router = express.Router();

// Example: GET /api/v1/telemedicine/health
router.get('/health', (req, res) => {
  res.json({ status: 'telemedicine route OK' });
});

module.exports = router; 