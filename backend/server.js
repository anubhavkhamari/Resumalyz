// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const resumeRouter = require('./routers/resumeRouter.js');
const { WebSocketServer } = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/resume-analyzer', {
  useNewUrlParser: true,  
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Test route
app.get('/', (req, res) => {
    console.log("listening");
  res.send('AI Resume Analyzer Backend Running');
});

const PORT = process.env.PORT || 5001;

// Start HTTP server
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// WebSocket server
const wss = new WebSocketServer({ server });
console.log('WebSocket server running ✅');

// Pass wss to router
app.use('/api/resume', resumeRouter(wss));