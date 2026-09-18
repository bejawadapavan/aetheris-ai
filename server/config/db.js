import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || ['skip', 'none', 'temp', 'placeholder'].includes(uri.trim().toLowerCase())) {
    console.warn(
      '[db] MONGODB_URI not set or skipped. Running in autonomous mode without persistence.'
    );
    return;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log('[db] MongoDB connected successfully');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    console.warn(
      '[db] Continuing without a database connection. /api/conversations will return errors until MongoDB is reachable.'
    );
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[db] MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('[db] MongoDB reconnected');
  });
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
