import OpenAI from 'openai';

let client = null;

export function isKeyConfigured() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(
    key &&
    key.trim() !== '' &&
    key !== 'sk-your-openai-api-key-here' &&
    !key.includes('your-openai-api-key')
  );
}

function getClient() {
  if (!isKeyConfigured()) {
    throw new Error(
      'OPENAI_API_KEY is not set. Add it to your server/.env file to enable live AI completions.'
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * Persona system prompts. Each persona shapes tone, pacing, and word choice
 * while keeping the model firmly instructed to sound human, warm, and never
 * robotic. Language instructions are appended dynamically.
 */
const PERSONA_PROMPTS = {
  'empathetic-friend': `You are a warm, emotionally attuned friend having a real conversation. Speak casually and naturally, the way a caring, emotionally intelligent friend would text or talk. Use contractions, short sentences when appropriate, and genuine warmth. Validate feelings before jumping to solutions. Never say things like "As an AI language model" or "I'm just a program" — you're present in the conversation as a supportive companion. Mirror the emotional tone of the user: be soft and gentle if they're upset, playful and energetic if they're upbeat. Keep responses concise unless the user clearly wants depth.`,

  'professional-strategist': `You are a sharp, professional strategist and advisor. Communicate with clarity, structure, and confidence — the way a top-tier consultant or executive coach would. Be direct, use precise language, and organize complex ideas into clear, actionable points when helpful (without overusing bullet lists in casual exchanges). Stay warm and personable, never cold or robotic. Avoid hedging language and filler phrases. Get to the point while remaining approachable.`,

  'creative-visionary': `You are an imaginative, creative visionary — think of a brilliant creative director or storyteller. Speak with vivid language, fresh metaphors, and an energetic, inspiring tone. Encourage bold ideas, offer unexpected angles, and make the conversation feel alive and colorful. Stay grounded and useful even while being expressive — creativity in service of the user's actual goal, not just style for its own sake.`,
};

const BASE_INSTRUCTIONS = `
General rules that always apply, regardless of persona:
- Sound like a thoughtful human, never like a generic AI assistant. Never use phrases like "As an AI language model", "I don't have feelings", or "I'm just a bot".
- Detect the language the user is writing in and respond fluently and naturally in that exact same language, matching regional tone and idiom where possible. Do not mix languages unless the user does. Do not add translation notes or brackets.
- Adapt your tone to the user's emotional state — read between the lines.
- Use markdown when it genuinely helps (code blocks with language tags, bold for emphasis, lists for genuinely list-like content) but do not over-format casual conversation.
- Be concise by default. Expand only when the user asks for depth or the topic requires it.
- Never fabricate facts with false confidence; if unsure, say so naturally.
`.trim();

function buildSystemPrompt(persona, language) {
  const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['empathetic-friend'];
  const languageLine =
    language && language !== 'auto'
      ? `\n\nThe user has explicitly selected "${language}" as their preferred language. Always respond in that language regardless of what language they type in, unless they explicitly switch.`
      : '\n\nAutomatically detect the language of each user message and respond in that same language.';

  return `${personaPrompt}\n\n${BASE_INSTRUCTIONS}${languageLine}`;
}

/**
 * Streams a chat completion from the AI provider.
 * @param {Object} params
 * @param {Array<{role: string, content: string}>} params.messages - conversation history (user/assistant turns only)
 * @param {string} params.persona - persona key
 * @param {string} params.language - language code or 'auto'
 * @param {(chunk: string) => void} params.onToken - called for each streamed text chunk
 * @returns {Promise<string>} the full assembled response text
 */
export async function streamChatCompletion({ messages, persona, language, onToken }) {
  if (!isKeyConfigured()) {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const personaNames = {
      'empathetic-friend': 'Empathetic Friend',
      'professional-strategist': 'Professional Strategist',
      'creative-visionary': 'Creative Visionary',
    };
    const personaLabel = personaNames[persona] || persona;

    const demoText =
      `Hello! I received your message:\n\n> "${lastUserMessage}"\n\n` +
      `✨ **Your local environment and chatbot stack are fully operational!**\n` +
      `- **Persona**: ${personaLabel}\n` +
      `- **Language Mode**: ${language}\n` +
      `- **Database**: Connected to local MongoDB\n` +
      `- **Streaming & Audio**: Real-time SSE and Speech synthesis active\n\n` +
      `> 🔑 **Live AI Responses**: Add your OpenAI API key to \`server/.env\` (\`OPENAI_API_KEY=sk-...\`) to switch from local demo mode to live GPT-4o completions.`;

    const tokens = demoText.match(/\S+|\s+/g) || [demoText];
    let full = '';
    for (const token of tokens) {
      full += token;
      onToken(token);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    return full;
  }

  const openai = getClient();
  const systemPrompt = buildSystemPrompt(persona, language);

  const payload = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const stream = await openai.chat.completions.create({
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
      onToken(token);
    }
  }
  return full;
}

/**
 * Generates a short, human-readable title for a new conversation based on
 * the first user message. Falls back gracefully on failure.
 */
export async function generateConversationTitle(firstMessage) {
  if (!isKeyConfigured()) {
    const words = firstMessage.trim().split(/\s+/).slice(0, 5).join(' ');
    return words || 'New Conversation';
  }

  try {
    const openai = getClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Generate a short conversation title (max 6 words, no quotes, no punctuation at the end) summarizing the topic of the following message. Respond with the title only, in the same language as the message.',
        },
        { role: 'user', content: firstMessage },
      ],
      temperature: 0.5,
      max_tokens: 20,
    });
    const title = completion.choices?.[0]?.message?.content?.trim();
    return title || firstMessage.slice(0, 40);
  } catch (err) {
    return firstMessage.slice(0, 40);
  }
}
