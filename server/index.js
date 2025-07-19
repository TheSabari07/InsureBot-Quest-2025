const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/chat', require('./routes/chat'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api/knowledge', require('./routes/knowledge'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'InsureBot API is running' });
});

app.listen(PORT, () => {
  console.log(`InsureBot server running on port ${PORT}`);
}); 