const voiceService = require('../services/voiceService');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class VoiceController {
  /**
   * POST /api/v1/voice/speech-to-text
   * Accepts audio file, returns transcription
   */
  async speechToText(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Audio file is required' });
      }
      const transcript = await voiceService.transcribeAudio(req.file.path);
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
      res.status(200).json({ success: true, transcript });
    } catch (error) {
      logger.error('Speech-to-text error:', error);
      res.status(500).json({ success: false, error: 'Failed to transcribe audio', message: error.message });
    }
  }

  /**
   * POST /api/v1/voice/text-to-speech
   * Accepts text, returns audio (wav)
   */
  async textToSpeech(req, res) {
    try {
      const { text, voice } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: 'Text is required' });
      }
      const audioBuffer = await voiceService.synthesizeSpeech(text, voice);
      res.set({
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="speech.wav"'
      });
      res.send(audioBuffer);
    } catch (error) {
      logger.error('Text-to-speech error:', error);
      res.status(500).json({ success: false, error: 'Failed to synthesize speech', message: error.message });
    }
  }

  /**
   * POST /api/v1/voice/query
   * Accepts audio file, transcribes, sends to AI, returns spoken answer
   */
  async voiceQuery(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Audio file is required' });
      }
      // 1. Transcribe audio
      const transcript = await voiceService.transcribeAudio(req.file.path);
      // 2. Get AI response
      const aiResponse = await aiService.processText(transcript, req.user); // Optionally pass user
      // 3. Synthesize speech
      const audioBuffer = await voiceService.synthesizeSpeech(aiResponse);
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
      res.set({
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="response.wav"'
      });
      res.send(audioBuffer);
    } catch (error) {
      logger.error('Voice query error:', error);
      res.status(500).json({ success: false, error: 'Failed to process voice query', message: error.message });
    }
  }
}

module.exports = new VoiceController(); 