const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const AZURE_SPEECH_KEY = process.env.SPEECH_API_KEY;
const AZURE_REGION = process.env.SPEECH_REGION;
const AZURE_SPEECH_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
const AZURE_TTS_ENDPOINT = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

class VoiceService {
  /**
   * Transcribe audio file to text using Azure Speech-to-Text
   * @param {string} audioFilePath - Path to the audio file (wav/mp3)
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeAudio(audioFilePath) {
    try {
      const audioData = fs.readFileSync(audioFilePath);
      const response = await axios.post(
        AZURE_SPEECH_ENDPOINT + '?language=en-US',
        audioData,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
            'Content-Type': 'audio/wav', // or 'audio/mp3' if mp3
            'Accept': 'application/json',
            'Transfer-Encoding': 'chunked'
          }
        }
      );
      if (response.data && response.data.DisplayText) {
        return response.data.DisplayText;
      }
      throw new Error('No transcription result');
    } catch (error) {
      logger.error('Azure STT error:', error.response?.data || error.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Synthesize speech from text using Azure Text-to-Speech
   * @param {string} text - Text to synthesize
   * @param {string} [voice="en-US-JennyNeural"] - Azure voice name
   * @returns {Promise<Buffer>} - Audio buffer (wav)
   */
  async synthesizeSpeech(text, voice = "en-US-JennyNeural") {
    try {
      const ssml = `<?xml version='1.0' encoding='utf-8'?>\n< speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='${voice}'>${text}</voice></speak>`;
      const response = await axios.post(
        AZURE_TTS_ENDPOINT,
        ssml,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
            'User-Agent': 'Hopitaliko-VoiceAPI'
          },
          responseType: 'arraybuffer'
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Azure TTS error:', error.response?.data || error.message);
      throw new Error('Failed to synthesize speech');
    }
  }
}

module.exports = new VoiceService(); 