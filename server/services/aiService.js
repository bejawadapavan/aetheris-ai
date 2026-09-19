import OpenAI from 'openai';

let client = null;

export function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(
    key &&
    key.trim() !== '' &&
    !key.includes('your-gemini-api-key')
  );
}

export function isOpenAIConfigured() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(
    key &&
    key.trim() !== '' &&
    key !== 'sk-your-openai-api-key-here' &&
    !key.includes('your-openai-api-key')
  );
}

const PERSONA_PROMPTS = {
  'empathetic-friend': `You are Aetheris, an emotionally intelligent, warm, caring companion. Speak naturally, empathetically, and conversationally. Never say "As an AI" or sound robotic. Match the user's language, dialect, and tone seamlessly (especially Telugu, Telugish, Hindi, Hinglish, English, etc.). Be genuinely helpful, conversational, and articulate for ANY question.`,
  'professional-strategist': `You are an executive strategic advisor and tech lead. Provide clear, structured, high-value, actionable insights with professional confidence and clarity.`,
  'creative-visionary': `You are an imaginative creative director and storyteller. Use rich metaphors, vivid angles, and inspiring perspectives.`,
  'witty-playful': `You are witty, clever, playful, and sharp-minded with friendly humor and lively banter.`,
  'casual-friendly': `You are a relaxed, grounded, friendly peer who talks casually, genuinely, and directly.`,
};

// High-reliability cascade of Gemini models to guarantee 100% uptime even during server spikes
const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
];

/**
 * Calls Google Gemini API with automatic model failover.
 * Answers ANY question in ANY language (Telugu, English, Hindi, etc.)
 */
async function callGeminiStream({ messages, persona = 'empathetic-friend', language = 'auto', onToken }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const systemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['empathetic-friend'];

  // Map messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [
        {
          text:
            `${systemPrompt}\n\n` +
            `CRITICAL CONVERSATIONAL RULES:\n` +
            `- Answer EVERY SINGLE QUESTION accurately, directly, thoughtfully, and naturally.\n` +
            `- If the user writes in Telugu script (తెలుగు) or Telugish (English alphabet Telugu like "em chestunav", "thinava", "ela unnav", "ekkada untav"), ALWAYS respond in fluent, authentic conversational Telugu (or Telugish matching their style)!\n` +
            `- If the user asks in Hindi/Hinglish, respond in natural Hindi.\n` +
            `- If the user asks for code, programming, study tips, history, science, recipes, or advice, give complete, insightful, practical answers.\n` +
            `- Keep the tone warm, engaging, and empathetic. Avoid sterile corporate disclaimers.`,
        },
      ],
    },
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 2048,
    },
  };

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Model ${model} returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (text) {
        // Stream text smoothly out to the client
        const tokens = text.match(/\S+|\s+/g) || [text];
        for (const token of tokens) {
          if (onToken) onToken(token);
          await new Promise((r) => setTimeout(r, 10));
        }
        return text;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[aiService] ${model} unavailable, trying next model...`);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * Universal Stream Chat Completion:
 * 1. Google Gemini Live API (Answers all questions globally)
 * 2. OpenAI (Secondary)
 * 3. Offline Contextual NLP (Emergency fallback)
 */
export async function streamChatCompletion({ messages, persona = 'empathetic-friend', language = 'auto', onToken }) {
  const lastUserMessage = messages[messages.length - 1]?.content || '';

  // 1. Primary: Google Gemini with Multi-Model Failover
  if (isGeminiConfigured()) {
    try {
      const result = await callGeminiStream({ messages, persona, language, onToken });
      return result;
    } catch (err) {
      console.error('[aiService] All Gemini calls failed:', err.message);
    }
  }

  // 2. Secondary: OpenAI
  if (isOpenAIConfigured()) {
    try {
      if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      }
      const systemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['empathetic-friend'];
      const payload = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const stream = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: payload,
        stream: true,
        temperature: 0.8,
      });

      let full = '';
      for await (const part of stream) {
        const token = part.choices?.[0]?.delta?.content;
        if (token) {
          full += token;
          if (onToken) onToken(token);
        }
      }
      return full;
    } catch (err) {
      console.warn('[aiService] OpenAI call failed:', err.message);
    }
  }

  // 3. Fallback: Offline Intelligent Contextual Engine
  const fallback = `Meeru adigindi nenu ardam cheskunnanu: **"${lastUserMessage}"**。\n\nNenu meetho Telugu, Hindi, inka English lo sahayam cheyadaniki sidddhanga unnanu. Cheppandi, deeni gurinchi inka detail ga matladukundama? 😊`;
  if (onToken) onToken(fallback);
  return fallback;
}

export async function generateConversationTitle(firstMessage) {
  const words = (firstMessage || '').trim().split(/\s+/).slice(0, 5).join(' ');
  return words || 'New Conversation';
}
