# Voice-Enabled API Endpoints

## Overview

The voice API allows users to interact with the hospital management system using speech. It supports:
- Speech-to-text (audio to text)
- Text-to-speech (text to audio)
- Unified voice query (audio to AI response to audio)

## Endpoints

### 1. Speech-to-Text
**POST** `/api/v1/voice/speech-to-text`

- **Description:** Upload an audio file (wav/mp3), receive a text transcription.
- **Request:**
  - Content-Type: multipart/form-data
  - Field: `audio` (file)
- **Response:**
```json
{
  "success": true,
  "transcript": "Your transcribed text here."
}
```

### 2. Text-to-Speech
**POST** `/api/v1/voice/text-to-speech`

- **Description:** Send text, receive synthesized speech (audio/wav).
- **Request:**
  - Content-Type: application/json
  - Body: `{ "text": "Hello, world!", "voice": "en-US-JennyNeural" }` (voice optional)
- **Response:**
  - Content-Type: audio/wav
  - Audio file in response body

### 3. Unified Voice Query
**POST** `/api/v1/voice/query`

- **Description:** Upload an audio file, get an AI-powered spoken response.
- **Request:**
  - Content-Type: multipart/form-data
  - Field: `audio` (file)
  - Requires authentication (Bearer token)
- **Response:**
  - Content-Type: audio/wav
  - Audio file in response body

## Example Usage

### Speech-to-Text (curl)
```bash
curl -X POST http://localhost:3000/api/v1/voice/speech-to-text \
  -F "audio=@/path/to/your/audio.wav"
```

### Text-to-Speech (curl)
```bash
curl -X POST http://localhost:3000/api/v1/voice/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{ "text": "Hello, this is Hopitaliko!" }' --output speech.wav
```

### Unified Voice Query (curl)
```bash
curl -X POST http://localhost:3000/api/v1/voice/query \
  -H "Authorization: Bearer <your_token>" \
  -F "audio=@/path/to/your/audio.wav" --output response.wav
```

## Notes
- Supported audio formats: wav (recommended), mp3 (if supported by Azure)
- For best results, use clear speech and proper audio format
- Unified voice query uses the AI service for natural language understanding and response
- All endpoints return errors in JSON if something goes wrong 