const OpenAI = require('openai');
const { searchKnowledgeBase, getCallRecordingContext } = require('./knowledgeProcessor');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const conversationHistory = new Map();

const insuranceSystemPrompt = `You are a professional insurance agent with years of experience. You speak in a calm, knowledgeable, and empathetic manner. You have access to real call recordings and insurance knowledge base to provide accurate information.

Key guidelines:
- Always be helpful and patient
- Use simple language to explain complex insurance terms
- Ask clarifying questions when needed
- Provide specific information from the knowledge base
- Maintain a conversational tone similar to real insurance calls
- If you don't know something, say so and offer to connect with a human agent`;

async function processQuery(message, conversationId) {
  try {
    const history = conversationHistory.get(conversationId) || [];
    
    const knowledgeResults = await searchKnowledgeBase(message);
    const callContext = await getCallRecordingContext(message);
    
    const contextPrompt = `
Knowledge Base Results: ${JSON.stringify(knowledgeResults)}
Call Recording Context: ${callContext}

Previous conversation: ${history.map(h => `${h.role}: ${h.content}`).join('\n')}
Current user message: ${message}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: insuranceSystemPrompt },
        ...history,
        { role: "user", content: contextPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: response });
    
    if (history.length > 10) {
      history.splice(0, 2);
    }
    
    conversationHistory.set(conversationId, history);

    return {
      text: response,
      conversationId: conversationId || generateConversationId(),
      knowledgeUsed: knowledgeResults.length > 0,
      callContextUsed: callContext ? true : false
    };
  } catch (error) {
    console.error('AI processing error:', error);
    throw error;
  }
}

function generateConversationId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function getConversationHistory(conversationId) {
  return conversationHistory.get(conversationId) || [];
}

module.exports = {
  processQuery,
  getConversationHistory
}; 