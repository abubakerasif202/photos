import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

// A user-entered access token is mandatory in production. Never place it in Vite env.
const accessToken = process.env.GENERATION_ACCESS_TOKEN || '';
if (process.env.NODE_ENV === 'production' && accessToken.length < 24) {
  throw new Error('GENERATION_ACCESS_TOKEN must be configured (minimum 24 characters).');
}
const buckets = new Map<string, { count: number; resetAt: number }>();
let activeGenerations = 0;
const MAX_CONCURRENT = 2;
const rateWindowMs = 60 * 60 * 1000;
const rateLimit = Math.max(1, Number(process.env.GENERATION_HOURLY_LIMIT || 12));
const tokenMatches = (provided: string) => {
  const a = Buffer.from(provided);
  const b = Buffer.from(accessToken);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
app.use('/api/generate-image', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (accessToken && !tokenMatches(String(req.header('x-generation-token') || ''))) {
    res.status(401).json({ error: 'Access token required or incorrect.', code: 'AUTH_REQUIRED' });
    return;
  }
  const now = Date.now();
  const key = crypto.createHash('sha256').update(req.header('x-generation-token') || req.ip || 'local').digest('hex');
  const entry = buckets.get(key);
  const bucket = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + rateWindowMs };
  if (bucket.count >= rateLimit) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    res.status(429).json({ error: 'Hourly generation limit reached. Try again later.', code: 'RATE_LIMIT' });
    return;
  }
  if (activeGenerations >= MAX_CONCURRENT) {
    res.setHeader('Retry-After', '30');
    res.status(503).json({ error: 'The image studio is busy. Try again shortly.', code: 'BUSY' });
    return;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  // Remove expired entries so long-running servers do not accumulate client state.
  if (buckets.size > 1000) for (const [id, item] of buckets) if (item.resetAt <= now) buckets.delete(id);
  next();
});

// Initialize GoogleGenAI SDK on server side with required header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3-pro-image-preview',
    supportedSizes: ['1K', '2K', '4K'],
    brand: 'Ochre & Oak Renovations Sydney',
  });
});

// Image Generation Endpoint using gemini-3-pro-image-preview
app.post('/api/generate-image', async (req, res) => {
  activeGenerations += 1;
  try {
    const {
      prompt,
      styleBrief,
      aspectRatio = '16:9',
      imageSize = '2K',
      shotId,
    } = req.body ?? {};

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) {
      res.status(400).json({ error: 'Prompt must contain 1–4000 characters.' });
      return;
    }

    if (styleBrief !== undefined && (typeof styleBrief !== 'string' || styleBrief.length > 6000)) {
      res.status(400).json({ error: 'Style brief exceeds the allowed length.' });
      return;
    }
    if (shotId !== undefined && (!Number.isInteger(shotId) || shotId < 1 || shotId > 1000)) {
      res.status(400).json({ error: 'Invalid shot identifier.' });
      return;
    }
    // Validate imageSize affordance: 1K, 2K, 4K
    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '2K';

    // Map ratio to Gemini imageConfig format
    const validRatios = ['1:1', '16:9', '3:4', '4:3', '9:16'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    // Build the master prompt with the Australian Sydney Renovation Style Brief
    const combinedPrompt = styleBrief
      ? `${styleBrief}\n\nSPECIFIC SHOT INSTRUCTION:\n${prompt}`
      : prompt;

    console.log(`[ImageGen] Requesting size ${chosenSize}, ratio ${chosenRatio} with gemini-3-pro-image-preview...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: combinedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: chosenRatio,
          imageSize: chosenSize,
        },
      },
    });

    let imageUrl: string | null = null;


    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    if (!imageUrl) {
      res.status(502).json({
        error: 'No image data was returned by the model. Please check prompt content or safety restrictions.',
        code: 'NO_IMAGE',
      });
      return;
    }

    res.json({
      success: true,
      imageUrl,
      imageSize: chosenSize,
      aspectRatio: chosenRatio,
      prompt,
      shotId,
      model: 'gemini-3-pro-image-preview',
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[ImageGen Error]:', error);
    res.status(502).json({ error: 'The image provider could not complete this request. Retry or choose a lower resolution.', code: 'PROVIDER_ERROR' });
  } finally {
    activeGenerations -= 1;
  }
});

// Dev vs Prod Vite mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ochre & Oak Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
