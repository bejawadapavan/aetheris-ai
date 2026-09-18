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
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Core middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false, // handled at the reverse-proxy / hosting layer
  })
);
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:8000',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow localhost, 127.0.0.1, or same-origin requests
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Rate limiting (protects the AI endpoint from abuse) ---
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});
app.use('/api/chat', limiter);

// --- Health check aliases ---
app.get(['/api/health', '/health', '/api/v1/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes & Aliases ---
app.use(['/api/chat', '/chat', '/api/generate', '/generate', '/api/v1/chat'], chatRoutes);
app.use(['/api/conversations', '/conversations'], conversationRoutes);
app.use('/api/database', databaseRoutes);

// --- Static assets & SPA fallback (production / deployed local) ---
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/chat') || req.path.startsWith('/generate')) {
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
    console.log(`\n🚀 GenAI Chatbot API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });

  // Secondary listener on port 8000 for clients expecting localhost:8000
  if (Number(PORT) !== 8000) {
    try {
      const server8000 = app.listen(8000, '0.0.0.0', () => {
        console.log(`🚀 Also listening on http://localhost:8000 (connected for localhost:8000 frontends)\n`);
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

start();
