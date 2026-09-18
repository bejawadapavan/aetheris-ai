import express from 'express';
import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';

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

export default router;
