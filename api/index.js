import app from '../server/server.js';
import { connectDB } from '../server/config/db.js';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    try {
      await connectDB();
    } catch {
      // Continue in autonomous mode without crashing
    }
    initialized = true;
  }
  return app(req, res);
}
