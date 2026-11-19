import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatFriendlyGeminiError,
  getConfiguredModel,
  isAiConfigured,
  runSereMateCompanion,
  streamSereMateCompanion,
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

  app.post('/api/seremate/chat/stream', async (req, res) => {
    const body = req.body as {
      message?: string;
      history?: SereMateChatTurn[];
      ageBracket?: string;
      preferredLanguage?: string;
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

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const history = Array.isArray(body.history) ? body.history : [];
    let closed = false;
    req.on('close', () => {
      closed = true;
    });

    try {
      for await (const event of streamSereMateCompanion({
        message,
        history,
        ageBracket: body.ageBracket,
        preferredLanguage: body.preferredLanguage,
      })) {
        if (closed) break;
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      if (!closed) {
        res.end();
      }
    } catch (error) {
      if (!closed) {
        const friendly = formatFriendlyGeminiError(error);
        res.write(
          `data: ${JSON.stringify({
            type: 'error',
            error: friendly.message,
            code: friendly.code,
            status: friendly.status,
          })}\n\n`
        );
        res.end();
      }
    }
  });

  app.post('/api/seremate/chat', async (req, res) => {
    try {
      const body = req.body as {
        message?: string;
        history?: SereMateChatTurn[];
        ageBracket?: string;
        preferredLanguage?: string;
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
        preferredLanguage: body.preferredLanguage,
      });

      res.json(result);
    } catch (error) {
      const friendly = formatFriendlyGeminiError(error);
      res.status(friendly.status).json({
        error: friendly.message,
        code: friendly.code,
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
