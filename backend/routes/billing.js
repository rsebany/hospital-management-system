const express = require('express');
const router = express.Router();

// Example: GET /api/v1/billing/health
router.get('/health', (req, res) => {
  res.json({ status: 'billing route OK' });
});

module.exports = router; 