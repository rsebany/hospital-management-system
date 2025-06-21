const express = require('express');
const router = express.Router();

// Example: GET /api/v1/pharmacy/health
router.get('/health', (req, res) => {
  res.json({ status: 'pharmacy route OK' });
});

module.exports = router; 