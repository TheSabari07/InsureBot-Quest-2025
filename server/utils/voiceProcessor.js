const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

async function processVoiceInput(audioBuffer) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBuffer, 'audio.wav');
    formData.append('model', 'whisper-1');
    
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.text;
  } catch (error) {
    console.error('STT processing error:', error);
    throw new Error('Failed to process voice input');
  }
}

async function generateVoiceOutput(text, voiceType = 'default') {
  try {
    const voiceSettings = getVoiceSettings(voiceType);
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('TTS generation error:', error);
    throw new Error('Failed to generate voice output');
  }
}

function getVoiceSettings(voiceType) {
  const settings = {
    default: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    },
    professional: {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.1,
      use_speaker_boost: true
    },
    friendly: {
      stability: 0.4,
      similarity_boost: 0.6,
      style: 0.3,
      use_speaker_boost: true
    }
  };
  
  return settings[voiceType] || settings.default;
}

async function analyzeCallRecordingTone(audioBuffer) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBuffer, 'recording.wav');
    
    const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', formData, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      voiceId: response.data.voice_id,
      name: response.data.name,
      description: response.data.description
    };
  } catch (error) {
    console.error('Voice analysis error:', error);
    return null;
  }
}

async function cloneVoiceFromRecording(recordingPath, voiceName) {
  try {
    const audioData = await fs.readFile(recordingPath);
    
    const formData = new FormData();
    formData.append('name', voiceName);
    formData.append('description', `Insurance agent voice cloned from ${path.basename(recordingPath)}`);
    formData.append('files', audioData, 'recording.wav');
    
    const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', formData, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.voice_id;
  } catch (error) {
    console.error('Voice cloning error:', error);
    throw new Error('Failed to clone voice from recording');
  }
}

module.exports = {
  processVoiceInput,
  generateVoiceOutput,
  analyzeCallRecordingTone,
  cloneVoiceFromRecording
}; 