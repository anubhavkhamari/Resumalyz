const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { computeATS } = require('../util/ats.js');

const resumeRouter = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST resume + JD in memory
resumeRouter.post('/upload-resume', upload.single('resume'), async (req, res) => {
  const file = req.file;
  const { jd } = req.body;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  if (!jd) return res.status(400).json({ error: 'Job description required' });

  try {
    // 1️⃣ Extract resume text
    let resumeText = '';
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      resumeText = data.text;
    } else if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    // 2️⃣ Compute semantic ATS score
    const semanticMatchScore = await computeATS(resumeText, jd);

    // 3️⃣ Return JSON
    res.json({
      message: 'Resume uploaded and analyzed ✅',
      resumeTextSnippet: resumeText.slice(0, 200),
      jdSnippet: jd.slice(0, 200),
      semanticMatchScore, // 0-100%
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing resume' });
  }
});

module.exports = resumeRouter;
