import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v1Router } from './apps/server/src/routes/v1/index';
import { correlationMiddleware, standardizedErrorHandler } from './apps/server/src/middleware/observability';
import { initializeAiWorker } from './apps/server/src/workers/aiWorker';
import { initializeAnalyticsWorker } from './apps/server/src/workers/analyticsWorker';
import { initializeNotificationWorker } from './apps/server/src/workers/notificationWorker';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Initialize Asynchronous Worker Pools
  initializeAiWorker();
  initializeAnalyticsWorker();
  initializeNotificationWorker();

  // Basic Security & Observability Middlewares
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(correlationMiddleware);

  // Production Load Balancer / Health Probes
  app.get('/health', (req, res) => res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() }));
  app.get('/ready', (req, res) => res.status(200).send('READY'));
  app.get('/live', (req, res) => res.status(200).send('ALIVE'));

  // Versioned v1 API router & backward-compatible aliases
  app.use('/api/v1', v1Router);
  app.use('/api', v1Router); // Backward compatibility for legacy clients

  // Standardized Error Handler (Catches all uncaught route errors)
  app.use(standardizedErrorHandler);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Dynamic import of Vite in development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[JanSetu] Vite middlewares mounted for development');
  } else {
    // Serve production build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[JanSetu] Serving static files from ${distPath}`);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  JANSETU AI PRODUCTION PLATFORM LIVE ON PORT ${PORT}`);
    console.log(`  "From Citizen Voice to Smarter Infrastructure"`);
    console.log(`  API v1: http://0.0.0.0:${PORT}/api/v1`);
    console.log(`  Health probe: http://0.0.0.0:${PORT}/health`);
    console.log(`====================================================`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    console.log(`[JanSetu] Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log('[JanSetu] Closed all active HTTP connections. Exiting cleanly.');
      process.exit(0);
    });

    // Force exit after 10s if hanging
    setTimeout(() => {
      console.error('[JanSetu] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[JanSetu Server Error]:', err);
  process.exit(1);
});
