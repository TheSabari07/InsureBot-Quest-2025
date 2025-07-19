const express = require('express');
const router = express.Router();
const { searchKnowledgeBase, loadCallRecordings } = require('../utils/knowledgeProcessor');

router.get('/faq', async (req, res) => {
  try {
    const { query } = req.query;
    const results = await searchKnowledgeBase(query);
    res.json(results);
  } catch (error) {
    console.error('Knowledge search error:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

router.get('/call-recordings', async (req, res) => {
  try {
    const recordings = await loadCallRecordings();
    res.json(recordings);
  } catch (error) {
    console.error('Call recordings error:', error);
    res.status(500).json({ error: 'Failed to load call recordings' });
  }
});

router.post('/analyze-recording', async (req, res) => {
  try {
    const { audioData, recordingId } = req.body;
    const analysis = await analyzeCallRecording(audioData, recordingId);
    res.json(analysis);
  } catch (error) {
    console.error('Recording analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze recording' });
  }
});

module.exports = router; 