import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = fs.existsSync(envLocalPath)
  ? envLocalPath
  : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const app = express();
const port = Number(process.env.PORT ?? 8787);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is missing on the server.',
    });
  }

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  const model = typeof req.body?.model === 'string' && req.body.model.trim()
    ? req.body.model.trim()
    : 'gemini-2.5-flash';

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim() ?? '';
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    return res.json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({
      error: isProd ? 'Failed to generate content.' : (error as Error).message,
    });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
