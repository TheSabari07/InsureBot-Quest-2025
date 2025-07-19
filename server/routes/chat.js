const express = require('express');
const router = express.Router();
const { processQuery } = require('../utils/aiProcessor');

router.post('/message', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const startTime = Date.now();
    const response = await processQuery(message, conversationId);
    const latency = Date.now() - startTime;

    res.json({
      response: response.text,
      conversationId: response.conversationId,
      latency,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

router.get('/conversation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await getConversationHistory(id);
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

module.exports = router; 