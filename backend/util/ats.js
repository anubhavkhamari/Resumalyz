// ats.js
const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs'); 

let model;

// Load model once
async function loadModel() {
  if (!model) {
    model = await use.load();
    console.log("Universal Sentence Encoder model loaded ✅");
  }
  return model;
}

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
    const a = vecA.flatten(); // shape [512]
    const b = vecB.flatten(); // shape [512]
    const dotProduct = a.dot(b).dataSync()[0]; // now shapes match
    const normA = a.norm().dataSync()[0];
    const normB = b.norm().dataSync()[0];
    return dotProduct / (normA * normB);
  }
  

// Compute ATS semantic score
async function computeATS(resumeText, jdText) {
  const model = await loadModel();
  const embeddings = await model.embed([resumeText, jdText]);

  const resumeVec = embeddings.slice([0, 0], [1]);
  const jdVec = embeddings.slice([1, 0], [1]);

  const score = cosineSimilarity(resumeVec, jdVec);
  return Math.round(score * 100); // percentage 0-100%
}

module.exports = { computeATS };
