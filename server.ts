import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getConfiguredModel,
  isAiConfigured,
  runSereMateCompanion,
  type SereMateChatTurn,
} from './server/agents/seremateEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'seremate-api' });
  });

  app.get('/api/config/status', (_req, res) => {
    res.json({
      aiConfigured: isAiConfigured(),
      modelName: getConfiguredModel(),
    });
  });

  app.post('/api/seremate/chat', async (req, res) => {
    try {
      const body = req.body as {
        message?: string;
        history?: SereMateChatTurn[];
        ageBracket?: string;
      };

      const message = typeof body.message === 'string' ? body.message.trim() : '';
      if (!message) {
        res.status(400).json({ error: 'Please enter a message before sending.' });
        return;
      }
      if (message.length > 2000) {
        res.status(400).json({ error: 'Message is too long. Please keep it under 2,000 characters.' });
        return;
      }

      const history = Array.isArray(body.history) ? body.history : [];
      const result = await runSereMateCompanion({
        message,
        history,
        ageBracket: body.ageBracket,
      });

      res.json(result);
    } catch (error) {
      const err = error as { status?: number; code?: string; message?: string };
      const status = typeof err?.status === 'number' && err.status >= 400 ? err.status : 500;
      const rawMessage = err?.message || 'Unable to generate a response right now.';

      let friendlyError = rawMessage;
      if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('PERMISSION_DENIED')) {
        friendlyError =
          'The configured Gemini API key was rejected. Please verify GEMINI_API_KEY in Settings > Secrets.';
      } else if (rawMessage.includes('RESOURCE_EXHAUSTED') || status === 429) {
        friendlyError =
          'The AI service is temporarily busy (rate limit reached). Please wait a moment or browse Health Guidance and Support Resources.';
      }

      res.status(status).json({
        error: friendlyError,
        code: err?.code || String(status),
      });
    }
  });

  const distPath = path.resolve(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SereMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SereMate server:', err);
  process.exit(1);
});
