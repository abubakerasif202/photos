import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

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
  try {
    const {
      prompt,
      styleBrief,
      aspectRatio = '16:9',
      imageSize = '2K',
      shotId,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'A valid text prompt is required.' });
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
    let descriptionText = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          descriptionText += part.text;
        }
      }
    }

    if (!imageUrl) {
      res.status(502).json({
        error: 'No image data was returned by the model. Please check prompt content or safety restrictions.',
        details: descriptionText || 'Model finished without inline image output.',
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
    res.status(500).json({
      error: error?.message || 'Failed to generate image with gemini-3-pro-image-preview',
      details: error?.stack || String(error),
    });
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
