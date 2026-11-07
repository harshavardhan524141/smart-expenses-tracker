import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes/api.ts';
import { config } from './server/config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = config.port;

  // CORS Middleware
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health-check endpoint for Render / monitoring
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'Smart Expense Tracker & Budget Management System API',
      timestamp: new Date().toISOString(),
      supabaseConfigured: config.isConfigured,
    });
  });

  // REST API Routes
  app.use('/api', apiRouter);

  // Vite dev middleware or static production serve
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Central error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error occurred.',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Expense Tracker Server running at http://localhost:${PORT}`);
    console.log(`📡 REST API mounted at http://localhost:${PORT}/api`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
