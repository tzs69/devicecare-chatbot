const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
dotenv.config();


// FAQ question bank
const FAQs = [
  { q: 'What is DeviceCare?',
    a: 'DeviceCare is a comprehensive device management solution designed to help users monitor, protect, and optimize their electronic devices, ensuring they run smoothly and efficiently.' },
  { q: 'How do I install DeviceCare on my device?',
    a: 'Download the installer from our official website, run the setup file, and follow the on-screen instructions. DeviceCare is compatible with Windows, macOS, and major mobile operating systems.' },
  { q: 'What features does DeviceCare offer?',
    a: 'Device health monitoring, performance optimization, security scans, automated backups, and remote support capabilities.' },
  { q: 'Is DeviceCare compatible with all devices?',
    a: 'Compatible with most modern devices: Windows and macOS computers, plus Android and iOS smartphones and tablets. See the website compatibility page for the full list.' },
  { q: 'How do I perform a device health scan with DeviceCare?',
    a: "Open DeviceCare, go to the 'Health' tab, and click 'Run Scan'. The scan analyzes your device and provides optimization recommendations." },
  { q: 'Can DeviceCare protect my device from malware and viruses?',
    a: 'Yes. It includes robust security features with regular scans and real-time protection.' },
  { q: 'How can I contact DeviceCare support if I need help?',
    a: 'In-app support chat, email support@devicecare.com, or call the 24/7 hotline.' },
  { q: 'Does DeviceCare offer a free trial?',
    a: 'Yes, a 14-day free trial with access to all premium features. Sign up on the website or in the app.' },
  { q: 'How do I update DeviceCare to the latest version?',
    a: "Updates are checked automatically. You can also go to 'Settings' → 'Check for Updates'." },
  { q: 'Can I use DeviceCare on multiple devices with one subscription?',
    a: 'Yes. A single subscription covers multiple devices. Add devices via the app or web portal.' }
];

(async () => {
  // Concatenate question and answer into one string to give embeddings more signal
  const inputs = FAQs.map(f => `${f.q}\n${f.a}`); 

  console.log('Embedding FAQs…');

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const resp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: inputs,
  });
  // Embed each concatenated qa string into a high-dim vector 
  // Store embedded vector in 'out' array along with original question and answer for ease of retrieval
  const out = FAQ.map((f, idx) => ({
    q: f.q,
    a: f.a,
    embedding: resp.data[idx].embedding
  }));

  const outPath = path.join(__dirname, 'faqs.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2)); // Convert 'out' to json(w indent) and write to faqs.json
  console.log('Wrote', outPath);
})().catch(e => {
  console.error(e);
  process.exit(1);
});