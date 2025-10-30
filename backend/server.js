// backend/server.js
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf2pic from 'pdf2pic';

dotenv.config();
const app = express();
app.use(cors()); // tighten in production
app.use(express.json({ limit: '5mb' }));
fs.mkdirSync('uploads', { recursive: true });

console.log('Loaded GEMINI_API_KEY env:', !!process.env.GEMINI_API_KEY);

/**
 * NOTE:
 * - Ensure you have your GEMINI API key set appropriately (see README or .env)
 * - If using Google service account JSON file (GOOGLE_APPLICATION_CREDENTIALS), set that env as well.
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper for colors + emojis
function getTestColorEmoji(test, value, low, high) {
  const t = (test || '').toLowerCase();
  let color = '#A3C4F3'; // default pastel blue
  let emoji = '🩺';
  if (t.includes('rbc') || t.includes('hemoglobin') || t.includes('hb') || t.includes('hematocrit')) {
    emoji = '🩸';
    color = (typeof value === 'number' && low != null && high != null && value >= low && value <= high) ? '#A5D6A7' : '#EF5350';
  } else if (t.includes('wbc') || t.includes('leukocyte')) {
    emoji = '⚪';
    color = (typeof value === 'number' && low != null && high != null && value >= low && value <= high) ? '#B2DFDB' : '#EF5350';
  } else if (t.includes('cholesterol')) {
    emoji = '🥚';
    color = (typeof value === 'number' && low != null && high != null && value <= high) ? '#FFCC80' : '#EF5350';
  } else if (t.includes('glucose') || t.includes('sugar')) {
    emoji = '🍬';
    color = (typeof value === 'number' && low != null && high != null && value >= low && value <= high) ? '#A5D6A7' : '#EF5350';
  } else if (t.includes('platelet')) {
    emoji = '🧪';
    color = (typeof value === 'number' && low != null && high != null && value >= low && value <= high) ? '#FDE68A' : '#EF5350';
  } else if (t.includes('mch') || t.includes('mchc') || t.includes('mpv')) {
    emoji = '🔬';
    color = (typeof value === 'number' && low != null && high != null && value >= low && value <= high) ? '#A3C4F3' : '#EF5350';
  }
  return { color, emoji };
}

// multer config
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.get('/', (req, res) => res.send('🩺 MedNarrate backend running'));

/**
 * POST /analyze
 * form-data: file (PDF/PNG/JPG/TXT), language (English/Hindi/Telugu/Malayalam/Kannada/Tamil)
 * Returns JSON analysis (see prompt structure)
 */
app.post('/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const selectedLanguage = req.body.language || 'English';
  const filePath = req.file.path;
  let extractedText = '';

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();

    // PDF -> convert first page to PNG using pdf2pic
    if (ext === '.pdf') {
      fs.mkdirSync('./uploads/temp_images', { recursive: true });
      const storeAsImage = pdf2pic.fromPath(filePath, {
        density: 150,
        saveFilename: 'page',
        savePath: './uploads/temp_images',
        format: 'png',
        width: 1200,
        height: 1600,
      });
      const convertResult = await storeAsImage(1); // first page
      const imgPath = convertResult.path;
      const ocr = await Tesseract.recognize(imgPath, 'eng'); // english OCR by default
      extractedText = (ocr?.data?.text || '').trim();
      // cleanup
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      try { fs.rmdirSync('./uploads/temp_images', { recursive: true }); } catch (e) {}
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const ocr = await Tesseract.recognize(filePath, 'eng');
      extractedText = (ocr?.data?.text || '').trim();
    } else if (ext === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf8').trim();
    } else {
      throw new Error('Unsupported file type. Upload PDF, PNG, JPG, JPEG, or TXT.');
    }

    if (!extractedText) throw new Error('Could not extract readable text from the uploaded report.');

    // --- FULL MEDNARRATE PROMPT (kept complete and detailed) ---
    const prompt = `
You are **MedNarrate**, a kind and professional AI health explainer.

Your task: Read the provided medical report text and return a structured, clear, and empathetic analysis.
You must generate **a single valid JSON object** — parseable by JSON.parse — that contains:
1️⃣ extracted medical test data, 
2️⃣ plain-language summaries,
3️⃣ visualization-friendly fields,
4️⃣ emotional reassurance (without giving medical advice).

---

### RULES

- Be calm, factual, warm — never robotic, never overly sweet.
- No medical advice. Use phrases like "suggests", "may indicate", or "appears".
- Simplify jargon while respecting accuracy.
- Include empathy naturally: speak like a kind medical narrator who reassures.
- Handle *any* report format: blood test, radiology, pathology, etc.
- If you can't read something, set it to "unknown".
- Normalize units (e.g. µg → ug, μL → uL).
- Handle <, >, ≤, ≥, and range formats like "12–16", "<200", "4.0-5.5", etc.

---

### OUTPUT FORMAT

Return **only** valid JSON (no extra text, no markdown, no explanations).

{
  "metadata": {
    "language": "<detected language, e.g. en>",
    "confidence_overall": <0.0–1.0>,
    "sample_excerpt": "<short snippet of extracted text>"
  },
  "tests": [
    {
      "test": "<test name>",
      "aliases": ["<optional alternate names>"],
      "value_text": "<value + unit as shown in report>",
      "value_numeric": <numeric value or null>,
      "unit": "<unit>",
      "normal_range_text": "<as written in report>",
      "normal_range": {"low": <number|null>, "high": <number|null>, "type": "<range|less-than|greater-than|unknown>"},
      "flag": "<normal|low|high|borderline|unknown>",
      "confidence": <0.0–1.0>,
      "notes": "<short parsing notes if any>",
      "history": [{"date": "<optional date>", "value": <number|null>, "unit": "<unit>"}],
      "lifestyle_recommendation": "<one-line practical non-medical lifestyle suggestion for this test if out-of-range, otherwise empty>"
    }
  ],
  "summary": "<A few short sentences summarizing key findings — simple, kind, and human. Avoid fear or jargon.>",
  "key_points": {
    "normal_values": ["<tests within range>"],
    "out_of_range": ["<tests that are slightly low/high>"],
    "critical_flags": ["<tests that seem significantly abnormal>"]
  },
  "recommendations": [
    "<detailed, specific, non-medical lifestyle suggestions for items out of range — example: 'For low hemoglobin consider iron-rich foods like spinach, dates, jaggery; avoid tea with meals; try vitamin C with meals to improve iron absorption.'>"
  ],
  "emotional_tone": "<1–3 lines of natural reassurance, kind but not forced.>",
  "glossary": [
    {"term": "<medical term>", "definition": "<simple definition anyone can understand>"}
  ],
  "visualization_data": [
    {
      "test": "<test name>",
      "value_numeric": <number|null>,
      "unit": "<unit>",
      "normal_low": <number|null>,
      "normal_high": <number|null>,
      "flag": "<normal|low|high|borderline|unknown>"
    }
  ]
}

---

### LANGUAGE
Please write the "summary", "emotional_tone" and "recommendations" in ${selectedLanguage} language while preserving clarity and empathetic tone. If ${selectedLanguage} is English, use English. If Hindi/Telugu/Malayalam/Kannada/Tamil, translate appropriately but keep simple lines.

REPORT TEXT:
${extractedText}
    `;

    // call Gemini (gemini-2.0-flash or gemini-2.5 depending on availability)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent(prompt);
    let aiRaw = (await response.response.text()).trim();
    // Clean code fences and stray text
    aiRaw = aiRaw.replace(/```json/gi, '').replace(/```/g, '').trim();

    // try parse
    let parsed;
    try {
      parsed = JSON.parse(aiRaw);
    } catch (err) {
      // If JSON invalid, return raw output for debugging
      try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(500).json({ success: false, error: 'AI returned invalid JSON', raw: aiRaw });
    }

    // Ensure visualization_data exists and enrich with colors & emojis
    if (Array.isArray(parsed.visualization_data)) {
      parsed.visualization_data = parsed.visualization_data.map((it) => {
        const value = typeof it.value_numeric === 'number' ? it.value_numeric : null;
        const low = typeof it.normal_low === 'number' ? it.normal_low : null;
        const high = typeof it.normal_high === 'number' ? it.normal_high : null;
        const { color, emoji } = getTestColorEmoji(it.test, value, low, high);
        return { ...it, color: it.color || color, emoji: it.emoji || emoji };
      });
    } else {
      parsed.visualization_data = [];
    }

    // Merge per-test lifestyle_recommendation into top-level recommendations if present
    let recs = Array.isArray(parsed.recommendations) ? parsed.recommendations.slice() : [];
    if (Array.isArray(parsed.tests)) {
      parsed.tests.forEach((t) => {
        if (t.lifestyle_recommendation && !recs.includes(t.lifestyle_recommendation)) recs.push(t.lifestyle_recommendation);
      });
    }
    parsed.recommendations = recs;

    // cleanup uploaded file for privacy
    try { fs.unlinkSync(filePath); } catch (e) {}

    return res.json({ success: true, analysis: parsed });
  } catch (err) {
    try { fs.unlinkSync(filePath); } catch (e) {}
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

/**
 * POST /translate
 * body: { text: "...", target: "Hindi" }
 * Uses Gemini to translate preserving tone and line breaks; returns only translated text.
 */
app.post('/translate', async (req, res) => {
  try {
    const { text, target } = req.body || {};
    if (!text || !target) return res.status(400).json({ success: false, error: 'text and target required' });

    const translatePrompt = `
You are MedNarrate translator. Translate the following text into ${target}. Preserve tone (warm, empathetic), preserve line breaks. Return ONLY the translated text, no JSON, no quotes.

TEXT:
${text}
`;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent(translatePrompt);
    const translated = (await response.response.text()).trim();
    return res.json({ success: true, translated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.listen(5000, () => console.log('🩺 MedNarrate backend running on port 5000'));