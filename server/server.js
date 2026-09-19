import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import chatRoutes from './routes/chat.js';
import conversationRoutes from './routes/conversations.js';
import databaseRoutes from './routes/database.js';
import authRoutes from './routes/auth.js';
import securityRoutes from './routes/security.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security & Core middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any origin for seamless local and mobile cross-origin access
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept', 'X-Requested-With'],
  })
);

app.use(compression());
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Rate limiting ---
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});
app.use('/api/chat', limiter);

// --- Health check aliases ---
app.get(['/api/health', '/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'ok',
    security: 'AES-256-GCM + JWT Active',
    timestamp: new Date().toISOString(),
  });
});

// --- Routes & Aliases ---
app.use(['/api/chat', '/chat', '/api/generate', '/generate', '/api/v1/chat'], chatRoutes);
app.use(['/api/conversations', '/conversations', '/api/sessions', '/sessions'], conversationRoutes);
app.use('/api/database', databaseRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/security', '/security'], securityRoutes);

// --- Static assets & SPA fallback ---
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/chat') ||
      req.path.startsWith('/generate') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/security') ||
      req.path.startsWith('/sessions')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDB();

  // Primary server (default 5000)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Aetheris AI API & Security Gateway running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Auth routes:  http://localhost:${PORT}/api/auth/login & /register`);
    console.log(`   Security:     http://localhost:${PORT}/api/security/status (AES-256-GCM)`);
  });

  // Secondary listener on port 8000 for clients expecting localhost:8000
  if (Number(PORT) !== 8000) {
    try {
      const server8000 = app.listen(8000, '0.0.0.0', () => {
        console.log(`🚀 Also listening on http://localhost:8000 (Universal bridge for localhost:8000)\n`);
      });
      server8000.on('error', (err) => {
        if (err.code !== 'EADDRINUSE') {
          console.warn('Port 8000 listener notice:', err.message);
        }
      });
    } catch (e) {
      // ignore
    }
  }
}

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  start();
}

export default app;
