import express from 'express';
import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import AnalyticsLog from '../models/AnalyticsLog.js';
import Persona from '../models/Persona.js';
import PromptTemplate from '../models/PromptTemplate.js';

const router = express.Router();

router.get('/status', async (req, res) => {
  const connected = isDbConnected();
  if (!connected) {
    return res.json({ connected: false, message: 'Database is not connected' });
  }

  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const stats = [];

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      stats.push({ name: col.name, count });
    }

    res.json({
      connected: true,
      databaseName: db.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState,
      collections: stats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/analytics', async (req, res) => {
  try {
    const { model, persona, language, latency, latencyMs, tokens, status } = req.body;
    const log = await AnalyticsLog.create({
      model: model || 'gemini-3-flash-preview',
      persona: persona || 'empathetic-friend',
      language: language || 'auto',
      latencyMs: Number(latencyMs || latency) || 180,
      tokens: Number(tokens) || 50,
      status: status || 'success',
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/personas', async (req, res) => {
  try {
    const personas = await Persona.find().sort({ createdAt: 1 });
    res.json({ personas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/prompts', async (req, res) => {
  try {
    const prompts = await PromptTemplate.find().sort({ usageCount: -1 });
    res.json({ prompts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
