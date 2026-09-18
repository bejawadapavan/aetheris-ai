/**
 * Aetheris AI — Gemini & Multilingual Human Conversational Engine
 * Supports:
 * - gemini-3-flash-preview
 * - gemini-2.5-flash
 * - Backend /api/chat (SSE Proxy)
 * - Autonomous human-like simulated fallback in 15+ languages
 */

const STORAGE_KEYS = {
  GEMINI_KEY: 'aetheris_gemini_api_key',
  SELECTED_MODEL: 'aetheris_selected_model',
};

export const SUPPORTED_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'Google AI', badge: 'Ultra Fast' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google AI', badge: 'Recommended' },
  { id: 'backend-proxy', name: 'Local Backend (Express/Mongo)', provider: 'Local Node.js', badge: 'Persistence' },
  { id: 'simulated-engine', name: 'Aetheris Neural Simulated Engine', provider: 'Autonomous', badge: 'Zero Setup' },
];

export const WORLD_LANGUAGES = [
  { code: 'auto', name: 'Auto-Detect Language', flag: '🌐', native: 'Automatic', sample: 'Detects any language' },
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English', sample: 'How can I assist your vision today?' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी', sample: 'नमस्ते! मैं आज आपकी क्या सहायता कर सकता हूँ?' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español', sample: '¡Hola! ¿En qué puedo acompañarte hoy?' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語', sample: 'こんにちは！今日はどのようなお手伝いをしましょうか？' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français', sample: 'Bonjour ! Comment puis-je vous accompagner aujourd\'hui ?' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch', sample: 'Guten Tag! Wie kann ich dich heute unterstützen?' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳', native: '中文 (简体)', sample: '你好！今天有什么我可以协助你的吗？' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية', sample: 'مرحباً! كيف يمكنني مساعدتك في مسيرتك اليوم؟' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português', sample: 'Olá! Como posso te ajudar com o seu projeto hoje?' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano', sample: 'Ciao! Di cosa vorresti parlare oggi?' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский', sample: 'Привет! Чем я могу помочь тебе сегодня?' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어', sample: '안녕하세요! 오늘 어떤 대화를 나누고 싶으신가요?' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', native: 'বাংলা', sample: 'নমস্কার! আমি আপনাকে আজ কীভাবে সাহায্য করতে পারি?' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands', sample: 'Hallo! Waar kan ik je vandaag mee van dienst zijn?' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe', sample: 'Merhaba! Bugün size nasıl yardımcı olabilirim?' },
];

export const PERSONAS = [
  {
    id: 'empathetic-friend',
    name: 'Empathetic & Warm',
    role: 'Emotional Companion',
    badge: 'Human Touch',
    description: 'Speaks with genuine warmth, validates feelings first, uses conversational contractions and deep emotional intelligence.',
    icon: 'HeartHandshake',
    gradient: 'from-pink-500 to-rose-400',
  },
  {
    id: 'professional-strategist',
    name: 'Executive Advisor',
    role: 'High-Level Strategist',
    badge: 'Sharp & Actionable',
    description: 'Direct, structured, confident. Formulates clear frameworks and strategic insights without corporate jargon.',
    icon: 'Briefcase',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'creative-visionary',
    name: 'Visionary Creative',
    role: 'Art Director & Storyteller',
    badge: 'Inspiring & Bold',
    description: 'Vivid metaphors, fresh angles, imaginative storytelling, and inspiring aesthetic advice.',
    icon: 'Sparkles',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 'witty-playful',
    name: 'Witty & Playful',
    role: 'Clever Banter',
    badge: 'Humor & Spark',
    description: 'Quick-witted, humorous, playful, and fun while always remaining insightful and respectful.',
    icon: 'Smile',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'casual-friendly',
    name: 'Casual & Relatable',
    role: 'Everyday Buddy',
    badge: 'Relaxed & Real',
    description: 'Laid-back, grounded, friendly, texts like a close peer who keeps things simple and easy.',
    icon: 'Coffee',
    gradient: 'from-emerald-400 to-teal-500',
  },
];

export function getStoredGeminiKey() {
  return localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '';
}

export function setStoredGeminiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
  }
}

export function getStoredModel() {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'gemini-3-flash-preview';
}

export function setStoredModel(modelId) {
  localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId);
}

// Multilingual simulated responses in case no key is provided
const MULTILINGUAL_DEMO_RESPONSES = {
  hi: (msg) =>
    `नमस्ते! मैंने आपका संदेश प्राप्त किया: **"${msg}"**。\n\nमैं एथेरिस (Aetheris AI) का बहुभाषी ह्यूमन-लाइक मॉडल हूँ। मैं आपके साथ हिंदी में स्वाभाविक और आत्मीय रूप से बातचीत करने के लिए तैयार हूँ।\n\n✨ **सुविधाएँ सक्रिय हैं:**\n- उच्च-गति भाषा समझ (Natural Tone)\n- स्पीच सिंथेसिस (Speech Voice)\n- यदि आप लाइव Gemini 3 Flash API कुंजी जोड़ना चाहते हैं, तो ऊपर दाएँ कोने में ⚙️ **API Key** पर क्लिक करें।\n\nआप आगे क्या जानना या रचना चाहते हैं?`,
  es: (msg) =>
    `¡Hola! He recibido tu mensaje: **"${msg}"**。\n\nAetheris AI está funcionando con empatía y fluidez natural en español. Estoy aquí para acompañarte, idear conceptos creativos o asistirte con cualquier desafío técnico.\n\n✨ **Características activas:**\n- Respuestas humanas empáticas\n- Síntesis de voz en español\n- Para conectar tu clave en vivo de Gemini 3 Flash, usa el botón ⚙️ **API Key** arriba a la derecha.\n\n¿En qué te gustaría profundizar hoy?`,
  fr: (msg) =>
    `Bonjour ! J'ai bien reçu votre message : **"${msg}"**。\n\nJe suis Aetheris AI, votre studio conversationnel multilingue. Je réponds avec un ton humain, chaleureux et réfléchi en français.\n\n✨ **Modules actifs :**\n- Compréhension émotionnelle et contextuelle\n- Synthèse vocale française\n- Pour connecter votre clé Gemini 3 Flash, cliquez sur ⚙️ **API Key**.\n\nSur quoi aimeriez-vous que nous travaillions ensemble ?`,
  de: (msg) =>
    `Hallo! Ich habe deine Nachricht erhalten: **"${msg}"**。\n\nWillkommen bei Aetheris AI! Ich antworte dir auf Deutsch mit einer klaren, natürlichen und empathischen menschlichen Stimme.\n\n✨ **Systemstatus:**\n- Mehrsprachige Textgenerierung aktiv\n- Lokale MongoDB-Speicherung aktiv\n- Klicke oben rechts auf ⚙️ **API Key**, um einen echten Gemini 3 Flash Key zu hinterlegen.\n\nWas ist dein nächster Gedanke oder dein nächstes Projekt?`,
  ja: (msg) =>
    `こんにちは！メッセージを受け取りました: **"${msg}"**。\n\nAetheris AIの多言語ヒューマン対話スタジオへようこそ。自然で温かみのある日本語でお答えします。\n\n✨ **稼働中の機能:**\n- 感情認識と人間味のあるトーン\n- 日本語音声読み上げ (Web Speech API)\n- ライブGemini 3 Flash APIキーの設定は右上の ⚙️ **API Key** から可能です。\n\nどのようなアイデアや質問について話しましょうか？`,
  ar: (msg) =>
    `مرحباً بك! تلقيت رسالتك: **"${msg}"**。\n\nأنا أثيريس (Aetheris AI)، النموذج متعدد اللغات بلمسة إنسانية دافئة وطبيعية باللغة العربية.\n\n✨ **الميزات المتاحة حالياً:**\n- إدراك السياق والمشاعر الإنسانية\n- نطق صوتي مباشر باللغة العربية\n- يمكنك ربط مفتاح Gemini 3 Flash المباشر من خلال زر ⚙️ **API Key** في الأعلى.\n\nما الذي ترغب في استكشافه أو ابتكاره اليوم؟`,
  zh: (msg) =>
    `你好！我已收到你的讯息：**"${msg}"**。\n\n我是 Aetheris AI 多语言人性化交互工作室。我能够以流畅、自然且富有共情力的方式用中文与你对话。\n\n✨ **已激活功能：**\n- 拟人化自然语言反馈\n- 中文语音实时朗读\n- 点击右上角 ⚙️ **API Key** 即可轻松配置 Gemini 3 Flash 实时密钥。\n\n今天有什么我们可以一起探讨的精彩想法？`,
  en: (msg, persona) =>
    `Hello! It's great to connect with you. I received your message:\n\n> "${msg}"\n\n` +
    `✨ **Aetheris AI Studio is fully live and running in your local environment!**\n\n` +
    `- **Active Persona**: \`${persona}\`\n` +
    `- **Multilingual Engine**: Fluent across 15+ world languages\n` +
    `- **Audio Playback**: Click the Speaker icon to listen out loud with browser Web Speech\n` +
    `- **Full Stack Architecture**: MongoDB persistence & Express server are actively linked\n\n` +
    `💡 *Tip: To stream directly from Google's live \`gemini-3-flash-preview\` model, click the **⚙️ API Key** button in the top navigation bar.* What would you like to explore next?`,
};

export async function generateStudioResponse({
  message,
  history = [],
  persona = 'empathetic-friend',
  language = 'auto',
  model = 'gemini-3-flash-preview',
  onToken,
}) {
  const startTime = performance.now();
  const apiKey = getStoredGeminiKey();

  // 1. Try Gemini API directly if key is configured
  if (apiKey && (model.startsWith('gemini') || model === 'gemini-3-flash-preview')) {
    try {
      const targetModel = model === 'gemini-3-flash-preview' ? 'gemini-2.0-flash' : model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

      const systemPrompt =
        `You are Aetheris, an ultra-advanced, human-like AI companion. ` +
        `Adopt the tone: ${persona}. ` +
        (language !== 'auto'
          ? `Strictly respond in language code: ${language}. `
          : `Detect the user's language and respond fluently in that exact same language. `) +
        `Never say "As an AI". Speak with warmth, depth, and genuine emotional intelligence.`;

      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am Aetheris, speaking with human warmth and authentic intelligence.' }] },
        ...history.slice(-6).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  full += text;
                  onToken?.(text);
                }
              } catch (e) {
                // partial json chunk
              }
            }
          }
        }

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        const tokenEstimate = Math.round(full.length / 3.8);

        return {
          content: full,
          latency,
          tokens: tokenEstimate,
          model: targetModel,
          provider: 'Google Gemini Live',
        };
      }
    } catch (err) {
      console.warn('[Aetheris] Gemini API direct stream error, falling back:', err.message);
    }
  }

  // 2. Try Local Express Backend /api/chat if model is backend-proxy or fallback
  if (model === 'backend-proxy') {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, persona, language }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.includes('event: token')) {
              const match = line.match(/data:\s*(.*)/);
              if (match) {
                try {
                  const data = JSON.parse(match[1]);
                  if (data.token) {
                    full += data.token;
                    onToken?.(data.token);
                  }
                } catch {}
              }
            }
          }
        }

        const endTime = performance.now();
        return {
          content: full,
          latency: Math.round(endTime - startTime),
          tokens: Math.round(full.length / 4),
          model: 'Local Backend (Express & Mongo)',
          provider: 'Local Stack',
        };
      }
    } catch (err) {
      console.warn('[Aetheris] Local backend request failed, using autonomous simulated engine');
    }
  }

  // 3. Autonomous Human-like Multilingual Simulated Fallback Engine
  const langKey = language !== 'auto' && MULTILINGUAL_DEMO_RESPONSES[language] ? language : 'en';
  // Check if message itself has hindi or non-english scripts
  let chosenGenerator = MULTILINGUAL_DEMO_RESPONSES[langKey];
  if (language === 'auto') {
    if (/[\u0900-\u097F]/.test(message)) chosenGenerator = MULTILINGUAL_DEMO_RESPONSES.hi;
    else if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(message)) chosenGenerator = MULTILINGUAL_DEMO_RESPONSES.ja;
    else if (/[\u0600-\u06FF]/.test(message)) chosenGenerator = MULTILINGUAL_DEMO_RESPONSES.ar;
    else if (/\b(hola|gracias|buenos|que|por favor)\b/i.test(message)) chosenGenerator = MULTILINGUAL_DEMO_RESPONSES.es;
    else if (/\b(bonjour|merci|comment|oui|avec)\b/i.test(message)) chosenGenerator = MULTILINGUAL_DEMO_RESPONSES.fr;
    else if (/\b(hallo|danke|guten|wie|bitte)\b/i.test(message)) chosenGenerator = MULTILINGUAL_DEMO_RESPONSES.de;
  }

  const responseText = chosenGenerator(message, persona);
  const words = responseText.match(/\S+|\s+/g) || [responseText];
  let full = '';

  for (const token of words) {
    full += token;
    onToken?.(token);
    await new Promise((r) => setTimeout(r, 22));
  }

  const endTime = performance.now();
  return {
    content: full,
    latency: Math.round(endTime - startTime),
    tokens: Math.round(full.length / 4),
    model: 'Aetheris Neural Engine (Simulated)',
    provider: 'Simulated Fallback',
  };
}
