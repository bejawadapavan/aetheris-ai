import 'dotenv/config';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Persona from '../models/Persona.js';
import PromptTemplate from '../models/PromptTemplate.js';
import AnalyticsLog from '../models/AnalyticsLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/genai_chatbot';

export async function initializeDatabase() {
  console.log(`========================================`);
  console.log(`Connecting to MongoDB: ${MONGODB_URI}`);
  console.log(`========================================`);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log(`Connected successfully to database: "${db.databaseName}"\n`);

  // 1. Seed Personas
  const personasCount = await Persona.countDocuments();
  if (personasCount === 0) {
    console.log('Seeding initial AI Personas...');
    await Persona.insertMany([
      {
        key: 'empathetic-friend',
        name: 'Empathetic & Warm',
        role: 'Emotional Companion',
        badge: 'Human Touch',
        description: 'Speaks with genuine warmth, emotional intelligence, validating feelings first.',
        systemPrompt: 'You are a warm, emotionally attuned friend having a real conversation. Speak casually and naturally.',
        icon: 'HeartHandshake',
      },
      {
        key: 'professional-strategist',
        name: 'Executive Advisor',
        role: 'High-Level Strategist',
        badge: 'Sharp & Actionable',
        description: 'Direct, structured, and confident strategic frameworks.',
        systemPrompt: 'You are a sharp, professional strategist and advisor. Communicate with clarity and precision.',
        icon: 'Briefcase',
      },
      {
        key: 'creative-visionary',
        name: 'Visionary Creative',
        role: 'Art Director & Storyteller',
        badge: 'Inspiring & Bold',
        description: 'Vivid metaphors, fresh angles, imaginative storytelling, and aesthetic advice.',
        systemPrompt: 'You are an imaginative, creative visionary. Speak with vivid language and fresh angles.',
        icon: 'Sparkles',
      },
      {
        key: 'witty-playful',
        name: 'Witty & Playful',
        role: 'Clever Banter',
        badge: 'Humor & Spark',
        description: 'Quick-witted, humorous, playful, and fun banter.',
        systemPrompt: 'You are witty, clever, playful, and quick to make humorous, thoughtful observations.',
        icon: 'Smile',
      },
      {
        key: 'casual-friendly',
        name: 'Casual & Relatable',
        role: 'Everyday Buddy',
        badge: 'Relaxed & Real',
        description: 'Laid-back, grounded, friendly, texts like a close peer.',
        systemPrompt: 'You are a relaxed, friendly peer having an easygoing conversation.',
        icon: 'Coffee',
      },
    ]);
    console.log('✓ 5 Personas inserted.');
  } else {
    console.log(`Personas collection already has ${personasCount} documents.`);
  }

  // 2. Seed Prompt Templates
  const promptsCount = await PromptTemplate.countDocuments();
  if (promptsCount === 0) {
    console.log('Seeding Creative Suite Prompt Templates...');
    await PromptTemplate.insertMany([
      {
        category: 'diffusion',
        title: 'Cyberpunk Android Meditation',
        description: 'High-detail futuristic cyberpunk prompt with volumetric lighting',
        template: 'A cyberpunk android meditating in a tranquil neon zen garden, intricate glowing circuits, volumetric fog, octane render, 8k --ar 16:9',
        tags: ['cyberpunk', 'octane', '8k'],
        usageCount: 42,
      },
      {
        category: 'copywriting',
        title: 'Viral Tech Product Thread',
        description: 'High-retention 3-part thread hook for SaaS products',
        template: 'Most software fails because of sterile onboarding. Here is how authentic human pacing fixes it...',
        tags: ['twitter', 'copywriting', 'viral'],
        usageCount: 28,
      },
      {
        category: 'code',
        title: 'SSE Streaming Route Architecture',
        description: 'Node.js Express Server-Sent Events edge streaming handler',
        template: 'Implement high-performance unbuffered SSE stream route with token chunking and abort signals',
        tags: ['express', 'sse', 'streaming', 'node'],
        usageCount: 35,
      },
    ]);
    console.log('✓ Prompt templates inserted.');
  } else {
    console.log(`PromptTemplates collection already has ${promptsCount} documents.`);
  }

  // 3. Seed Analytics Telemetry Logs
  const logsCount = await AnalyticsLog.countDocuments();
  if (logsCount === 0) {
    console.log('Seeding initial telemetry logs...');
    await AnalyticsLog.insertMany([
      { model: 'gemini-3-flash-preview', persona: 'empathetic-friend', language: 'en', latencyMs: 184, tokens: 142, status: 'success' },
      { model: 'gemini-3-flash-preview', persona: 'professional-strategist', language: 'hi', latencyMs: 210, tokens: 98, status: 'success' },
      { model: 'gemini-2.5-flash', persona: 'creative-visionary', language: 'es', latencyMs: 195, tokens: 165, status: 'success' },
      { model: 'Express + MongoDB', persona: 'empathetic-friend', language: 'ja', latencyMs: 32, tokens: 64, status: 'success' },
    ]);
    console.log('✓ Initial telemetry logs inserted.');
  } else {
    console.log(`AnalyticsLogs collection already has ${logsCount} documents.`);
  }

  // 4. Print collection summary
  const collections = await db.listCollections().toArray();
  console.log(`\n========================================`);
  console.log(`DATABASE "${db.databaseName}" SUMMARY`);
  console.log(`========================================`);
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`• Collection "${col.name}": ${count} documents`);
  }
  console.log(`========================================\n`);

  await mongoose.disconnect();
  console.log('Database initialization completed successfully.\n');
}

if (process.argv[1]?.endsWith('initDatabase.js')) {
  initializeDatabase().catch((err) => {
    console.error('Database initialization error:', err);
    process.exit(1);
  });
}
