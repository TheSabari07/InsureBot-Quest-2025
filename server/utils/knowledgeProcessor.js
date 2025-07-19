const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const knowledgeBase = new Map();
const callRecordings = new Map();

async function loadKnowledgeBase() {
  try {
    const dataPath = path.join(__dirname, '../../data');
    const files = await fs.readdir(dataPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(dataPath, file), 'utf8');
        const data = JSON.parse(content);
        
        if (file.includes('faq')) {
          knowledgeBase.set('faq', data);
        } else if (file.includes('policies')) {
          knowledgeBase.set('policies', data);
        }
      }
    }
  } catch (error) {
    console.error('Error loading knowledge base:', error);
  }
}

async function loadCallRecordings() {
  try {
    const recordingsPath = path.join(__dirname, '../../data/recordings');
    const files = await fs.readdir(recordingsPath);
    
    for (const file of files) {
      if (file.endsWith('.mp3') || file.endsWith('.wav')) {
        const recordingId = path.parse(file).name;
        const metadata = await extractRecordingMetadata(path.join(recordingsPath, file));
        callRecordings.set(recordingId, {
          id: recordingId,
          file: file,
          metadata: metadata
        });
      }
    }
  } catch (error) {
    console.error('Error loading call recordings:', error);
  }
}

async function searchKnowledgeBase(query) {
  const results = [];
  const faqData = knowledgeBase.get('faq') || [];
  const policiesData = knowledgeBase.get('policies') || [];
  
  const searchTerms = query.toLowerCase().split(' ');
  
  for (const item of faqData) {
    const relevance = calculateRelevance(item, searchTerms);
    if (relevance > 0.3) {
      results.push({
        type: 'faq',
        content: item,
        relevance
      });
    }
  }
  
  for (const item of policiesData) {
    const relevance = calculateRelevance(item, searchTerms);
    if (relevance > 0.3) {
      results.push({
        type: 'policy',
        content: item,
        relevance
      });
    }
  }
  
  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

async function getCallRecordingContext(query) {
  const relevantRecordings = [];
  
  for (const [id, recording] of callRecordings) {
    if (recording.metadata && recording.metadata.transcript) {
      const relevance = calculateRelevance(recording.metadata, query.toLowerCase().split(' '));
      if (relevance > 0.2) {
        relevantRecordings.push({
          id,
          transcript: recording.metadata.transcript,
          relevance
        });
      }
    }
  }
  
  if (relevantRecordings.length > 0) {
    const bestRecording = relevantRecordings.sort((a, b) => b.relevance - a.relevance)[0];
    return `Based on similar call recording: ${bestRecording.transcript}`;
  }
  
  return null;
}

async function extractRecordingMetadata(filePath) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Extract key information from this insurance call recording. Focus on the main topics discussed, customer questions, and agent responses."
        },
        {
          role: "user",
          content: `Analyze this call recording and provide: 1) Main topics discussed 2) Customer questions 3) Agent response style 4) Key insurance terms mentioned`
        }
      ],
      max_tokens: 300
    });
    
    return {
      transcript: completion.choices[0].message.content,
      analyzed: true
    };
  } catch (error) {
    console.error('Error extracting recording metadata:', error);
    return { transcript: 'Unable to analyze recording', analyzed: false };
  }
}

function calculateRelevance(item, searchTerms) {
  const text = JSON.stringify(item).toLowerCase();
  let matches = 0;
  
  for (const term of searchTerms) {
    if (text.includes(term)) {
      matches++;
    }
  }
  
  return matches / searchTerms.length;
}

module.exports = {
  loadKnowledgeBase,
  loadCallRecordings,
  searchKnowledgeBase,
  getCallRecordingContext,
  extractRecordingMetadata
}; 