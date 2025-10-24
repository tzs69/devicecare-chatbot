const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const cosine = require('./utils/cosine');
const { OpenAI } = require('openai');


const app = express();
app.use(cors());
app.use(express.json());


// Initialize FAQ knowledge base; ensure it is properly loaded before handling requests
const FAQ_PATH = path.join(__dirname, 'faqs.json');
let FAQ_STORE = [];

try {
  FAQ_STORE = JSON.parse(fs.readFileSync(FAQ_PATH, 'utf8'));
  console.log(`Loaded ${FAQ_STORE.length} FAQ vectors from faqs.json`);
} catch (e) {
  console.warn('Could not read faqs.json. Run: node seed-faq.js');
  FAQ_STORE = [];
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

    // Greeting gate for short greeting messages that are unlikely to contain any substantive query
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

    // Initialize OpenAI client and embedding model
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.trim().toLowerCase(),
    });
    // Embed user query into high-dim vector
    const userVec = emb.data[0].embedding;

    // Find best match (Highest cosine similarity value betw. user query vec and question-answer  pair vec)
    let best = null;
    let bestScore = -1;
    for (const row of FAQ_STORE) {
      const score = cosine(userVec, row.embedding);
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    }
    
    // Fallback Mechanism: Set threshold for within-scope; 
    // If cosine similarity between query and best match (qa pair) is below threshold, return default message
    const THRESHOLD = 0.55; 
    if (!best || bestScore < THRESHOLD) {
      console.log('[No match] highest sim =', bestScore.toFixed(3));
      return resp.json({
        reply:
          `Sorry, I can only answer questions covered in the DeviceCare FAQ.
          Try asking about installation, features, compatibility, health scans, 
          security, support, free trial, updates, or multi-device subscriptions.`,
      });
    }

    // Deterministic: At this point, answer is within scope of FAQ as not filtered out by greeting or threshold gate
    console.log('[FAQ match]', best?.q, 'sim = ', bestScore.toFixed(3));

    // Initialize assistant model for paraphrasing of best answer obtained from cosine search
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { 
          role: 'system', 
          content: `
            You are a DeviceCare customer service expert.

            Given a customer query, a question bank question and a question bank answer from the DeviceCare FAQ,
            rephrase the question bank answer to be more conversational, polite and easier to understand.
            
            DO NOT add any information that is not in the provided question bank answer.

            ONLY use affirmative injections when the customer query starts with 'Can', 'Could', 'Does', 'Is', 'May', 'Will' or 'Would',
            otherwise, DO NOT use them.
            
            Personalize the answer by addressing the customer directly as 'you' where appropriate.
          `
        },
        { 
          role: 'user', 
          content: `Customer query: ${query}\n Question bank question: ${best.q}\n Answer text:\n${best.a}` 
        },
      ],
    });
    // Paraphrase best answer using assistant model
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