import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { initializeDatabase } from './initDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const atlasUri = process.argv[2];

if (!atlasUri) {
  console.log('\nUsage: node server/scripts/connect-atlas.js "<YOUR_MONGODB_ATLAS_URI>"\n');
  process.exit(1);
}

async function testAndSave() {
  console.log('\nTesting connection to MongoDB Atlas...');
  try {
    await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Successfully connected to MongoDB Atlas!');
    await mongoose.disconnect();

    // Update .env
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (envContent.includes('MONGODB_URI=')) {
      envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${atlasUri}`);
    } else {
      envContent += `\nMONGODB_URI=${atlasUri}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Updated server/.env with MongoDB Atlas connection URI');

    // Run seed
    process.env.MONGODB_URI = atlasUri;
    console.log('\nSeeding default personas, prompts, and telemetry on Atlas...');
    await initializeDatabase();
    console.log('🎉 MongoDB Atlas is 100% connected, initialized, and ready for 24/7 cloud use!\n');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    console.error('Check your username, password, and ensure "0.0.0.0/0" is added in Atlas Network Access.');
    process.exit(1);
  }
}

testAndSave();
