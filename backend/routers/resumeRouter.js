const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { computeATS } = require('../util/ats.js');
const { extractKeywords, semanticKeywordMatch } = require("../util/keywords");
const { getHrAiReview } = require('../util/aiReview.js');

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = function (wss) {
  const router = express.Router();

  router.post('/upload-resume', upload.single('resume'), async (req, res) => {
    const file = req.file;
    const { jd } = req.body;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!jd) return res.status(400).json({ error: 'Job description required' });

    try {
      // Extract resume text
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
      }

      // Compute semantic score
      const semanticMatchScore = await computeATS(resumeText, jd);

      // Send immediate response
      res.json({
        message: 'Resume uploaded and analyzed ✅',
        semanticMatchScore,
        resumeTextSnippet: resumeText.slice(0, 200),
        jdSnippet: jd.slice(0, 200),
      });

      // Async keyword analysis
      setImmediate(async () => {
        try {
          const keywords = extractKeywords(jd);
          const missingKeywords = await semanticKeywordMatch(resumeText, keywords);

          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'missingKeywords',
                missingKeywords
              }));
            }
          });

          const hrReview = await getHrAiReview(resumeText, jd);

          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'hrReview',
                review: hrReview
              }));
            }
          });

        } catch (err) {
          console.error("Keyword analysis failed:", err);
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error processing resume' });
    }
  });

  return router;
};
