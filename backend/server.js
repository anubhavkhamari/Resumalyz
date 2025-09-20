// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const resumeRouter = require('./routers/resumeRouter.js');

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

app.use('/api/resume', resumeRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`http://localhost:${PORT}/`));
 