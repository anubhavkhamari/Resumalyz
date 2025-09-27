const natural = require("natural");
const use = require('@tensorflow-models/universal-sentence-encoder');
const stopwords = require('stopwords').english;

// Convert array to Set for faster lookup
const STOPWORDS = new Set(stopwords);

function extractKeywords(text) {
  // Remove punctuation, lowercase, and tokenize
  const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').toLowerCase();
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(cleanText);

  // Filter out stopwords and short words, then deduplicate
  const keywords = new Set();
  for (const word of words) {
    if (word.length > 2 && !STOPWORDS.has(word)) {
      keywords.add(word);
    }
  }

  return [...keywords];
}

module.exports = { extractKeywords };


async function semanticKeywordMatch(resumeText, jdKeywords) {
    const model = await use.load();
    const embeddings = await model.embed([resumeText, ...jdKeywords]);

    const resumeVec = embeddings.slice([0, 0], [1]); // first vector = resume
    const keywordVecs = embeddings.slice([1, 0], [jdKeywords.length]);

    const missing = [];
    jdKeywords.forEach((word, i) => {
        const sim = cosineSimilarity(resumeVec, keywordVecs.slice([i, 0], [1]));
        if (sim < 0.6) {  // threshold: treat <60% similar as "missing"
            missing.push(word);
        }
    });


    console.log("from keywords.js : ", missing);

    return missing;
}

function cosineSimilarity(vecA, vecB) {
    const a = vecA.flatten();
    const b = vecB.flatten();
    const dot = a.dot(b).dataSync()[0];
    const normA = a.norm().dataSync()[0];
    const normB = b.norm().dataSync()[0];
    return dot / (normA * normB);
}

module.exports = { extractKeywords, semanticKeywordMatch };
