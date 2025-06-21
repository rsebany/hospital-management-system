const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { body } = require('express-validator');
const voiceController = require('../controllers/voiceController');

// Multer setup for audio uploads
const upload = multer({ dest: 'uploads/' });

// Example: GET /api/v1/voice/health
router.get('/health', (req, res) => {
  res.json({ status: 'voice route OK' });
});

// Speech-to-Text: POST /api/v1/voice/speech-to-text
router.post(
  '/speech-to-text',
  upload.single('audio'),
  voiceController.speechToText
);

// Text-to-Speech: POST /api/v1/voice/text-to-speech
router.post(
  '/text-to-speech',
  [body('text').isString().notEmpty().withMessage('Text is required')],
  validateRequest,
  voiceController.textToSpeech
);

// Unified Voice Query: POST /api/v1/voice/query
router.post(
  '/query',
  authenticateToken,
  upload.single('audio'),
  voiceController.voiceQuery
);

module.exports = router; 