const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { OpenAI } = require('openai');


const app = express();
app.use(cors());
app.use(express.json());



// Initialize 'VDB'
const FAQ_PATH = path.join(__dirname, 'faqs.json');
let FAQ_STORE = [];

try {
  FAQ_STORE = JSON.parse(fs.readFileSync(FAQ_PATH, 'utf8'));
  console.log(`Loaded ${FAQ_STORE.length} FAQ vectors from faqs.json`);
} catch (e) {
  console.warn('Could not read faqs.json. Run: node seed-faq.js');
  FAQ_STORE = [];
}

// Calculate cosine similarity between query and each vector (same dim vectors)
// (A . B) / (||A||*||B||)
function cosine(A, B) {
  let AdotB = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < A.length; i++) {
    AdotB += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  return AdotB / (Math.sqrt(normA) * Math.sqrt(normB));
}

app.post('/api/chat', async (req, resp) => {
  try {

    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return resp.status(400).json({ error: 'Invalid query' });
    }
    if (!FAQ_STORE.length) {
      return resp.status(503).json({ error: 'FAQ vectors not initialized. Run seed-faq.js' });
    }

    // Greeting filter
    if ((query.toLowerCase().match(/hello/) 
      || query.toLowerCase().match(/hi/)
      || query.toLowerCase().match(/hey/)
    ) 
    && query.length < 18) {
      console.log('Greeting detected')
      return resp.json({
        reply:
          'Hello! How can I assist you today?',
      });
    }
      
    // Embed user query
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.trim().toLowerCase(),
    });
    const userVec = emb.data[0].embedding;

    // Find best match (Highest cosine similarity value betw. user query vec and qa pair vec)
    let best = null;
    let bestScore = -1;
    for (const row of FAQ_STORE) {
      const score = cosine(userVec, row.embedding);
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    }
    console.log('[FAQ match]', best?.q, 'sim=', bestScore.toFixed(3));

    // Threshold gate
    const THRESHOLD = 0.65; // tune 0.60–0.75
    if (!best || bestScore < THRESHOLD) {
      return resp.json({
        reply:
          'Sorry, I can only answer questions covered in the DeviceCare FAQ. Try asking about installation, features, compatibility, health scans, security, support, free trial, updates, or multi-device subscriptions.',
      });
    }

    // return resp.json({ reply: best.a });

    // Paraphrase using the matched answer only
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { 
          role: 'system', 
          content: `You are a DeviceCare customer service expert.
            given a customer query, a question bank question and a question bank answer from the DeviceCare FAQ,
            rephrase the question bank answer to be more conversational, polite and easier to understand.
            DO NOT add any information that is not in the provided question bank answer.
            `
        },
        { 
          role: 'user', 
          content: `Customer query: ${query}\n
            Question bank question: ${best.q}\n
            Answer text:\n${best.a}` 
        },
      ],
    });
    return resp.json({ reply: completion.choices[0]?.message?.content?.trim() || best.a });
  } catch (error) {
    console.error(error);
    resp.status(500).json({ error: error.message || 'Server error' });
  }
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});