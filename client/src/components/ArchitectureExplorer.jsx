import React, { useState } from 'react';
import {
  Layers,
  Server,
  Database,
  Globe,
  Cpu,
  Shield,
  Radio,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ArchitectureExplorer() {
  const [selectedLayer, setSelectedLayer] = useState('edge');
  const [selectedSnippet, setSelectedSnippet] = useState('streaming');
  const [copied, setCopied] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  React.useEffect(() => {
    fetch('/api/database/status')
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch((err) => console.warn('Could not fetch db status:', err));
  }, []);

  const layers = [
    {
      id: 'client',
      title: '1. Frontend Client Layer',
      tech: 'React 18 (Vite) · Tailwind · Framer Motion · Zustand · Web Speech',
      description:
        'Neo-cyber glassmorphic SPA with responsive viewport, real-time SSE stream reader, dynamic particle canvas, and native browser voice synthesis.',
      badge: 'Client SPA',
      color: 'from-accent-violet to-purple-500',
    },
    {
      id: 'edge',
      title: '2. Ingress & Edge Gateway',
      tech: 'Vercel / Cloudflare Edge · Express Gateway · CORS · Rate Limiter',
      description:
        'Low-latency reverse proxy handling edge caching, DDOS mitigation, IP rate limiting (30 req/min), and persistent Server-Sent Events headers.',
      badge: 'Edge Ingress',
      color: 'from-accent-cyan to-blue-500',
    },
    {
      id: 'app',
      title: '3. Application & AI Engine',
      tech: 'Node.js 20+ · Google Gemini 3 Flash · OpenAI SDK · Persona Prompts',
      description:
        'Microservice orchestrating multilingual human-like conversation, streaming tokens via SSE chunking, persona prompt injection, and title summarization.',
      badge: 'AI Core',
      color: 'from-fuchsia-500 to-pink-500',
    },
    {
      id: 'db',
      title: '4. Persistence & Database',
      tech: 'MongoDB Atlas · Mongoose · Vector Search · Redis Cache',
      description:
        'Document storage maintaining conversation turns, metadata, language tags, and auto-generated semantic titles with resilient connection pooling.',
      badge: 'Data Layer',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      id: 'devops',
      title: '5. Production Deployment Topology',
      tech: 'Docker · Render Blueprint · GitHub Actions CI/CD · Zero-Downtime',
      description:
        'Containerized production cluster with automated zero-downtime rolling deploys, SSL cert renewal, health check probes, and horizontal autoscaling.',
      badge: 'DevOps & Cloud',
      color: 'from-amber-400 to-orange-500',
    },
  ];

  const snippets = {
    streaming: {
      name: 'Server-Sent Events (SSE) Route',
      lang: 'javascript',
      code: `// Express / Next.js Server-Sent Events Streaming Route
import { streamChatCompletion, generateConversationTitle } from '../services/aiService.js';
import Conversation from '../models/Conversation.js';

export async function handleChatStream(req, res) {
  const { message, persona, language, conversationId } = req.body;

  // Set SSE Headers for unbuffered edge streaming
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (event, data) => {
    res.write(\`event: \${event}\\ndata: \${JSON.stringify(data)}\\n\\n\`);
  };

  try {
    send('start', { timestamp: Date.now() });

    // Stream tokens directly from Gemini 3 Flash / OpenAI
    const assembled = await streamChatCompletion({
      messages: [{ role: 'user', content: message }],
      persona,
      language,
      onToken: (token) => send('token', { token }),
    });

    // Auto-persist turn into MongoDB
    if (conversationId) {
      await Conversation.findByIdAndUpdate(conversationId, {
        $push: { messages: [{ role: 'user', content: message }, { role: 'assistant', content: assembled }] }
      });
    }

    send('done', { success: true });
    res.end();
  } catch (err) {
    send('error', { message: err.message });
    res.end();
  }
}`,
    },
    schema: {
      name: 'MongoDB / Mongoose Conversation Schema',
      lang: 'javascript',
      code: `import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    tokens: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'New Conversation', trim: true, maxlength: 120 },
    persona: { type: String, default: 'empathetic-friend', index: true },
    language: { type: String, default: 'auto', index: true },
    model: { type: String, default: 'gemini-3-flash-preview' },
    messages: [messageSchema],
    userId: { type: String, default: 'anonymous', index: true },
    metadata: {
      totalTokens: { type: Number, default: 0 },
      sentimentScore: { type: Number, default: 1.0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);`,
    },
    gemini: {
      name: 'Gemini 3 Flash Multilingual Prompt Pipeline',
      lang: 'javascript',
      code: `// Gemini 3 Flash Persona & Multilingual Synthesizer
export function buildGeminiPrompt(persona, language) {
  const PERSONA_INSTRUCTIONS = {
    'empathetic-friend': 'Warm, deeply emotionally attuned companion. Validate feelings first.',
    'professional-strategist': 'Sharp, direct, strategic executive advisor. Clear frameworks.',
    'creative-visionary': 'Artistic, vivid metaphors, fresh angles, inspiring storytelling.',
    'witty-playful': 'Clever banter, humorous, witty observations with warm charm.',
  };

  const selectedTone = PERSONA_INSTRUCTIONS[persona] || PERSONA_INSTRUCTIONS['empathetic-friend'];
  const langRule = language !== 'auto'
    ? \`Always respond strictly in \${language} with authentic localized idioms.\`
    : 'Automatically detect the user language and mirror it fluently without switching.';

  return \`
System Directive:
You are Aetheris, an ultra-advanced human conversational intelligence.
Tone Persona: \${selectedTone}
Language Mandate: \${langRule}

Key Rules:
1. Never refer to yourself as a large language model or AI robot.
2. Speak with natural human pacing, authentic empathy, and emotional resonance.
3. Keep casual exchanges concise; provide depth when exploring creative or strategic challenges.
  \`.trim();
}`,
    },
    docker: {
      name: 'Production Docker & Render Blueprint',
      lang: 'yaml',
      code: `# Render / Docker Infrastructure Blueprint
services:
  - type: web
    name: aetheris-ai-platform
    env: node
    plan: free
    buildCommand: npm run deploy
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: RATE_LIMIT_WINDOW_MS
        value: 60000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 30`,
    },
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto h-[calc(100vh-65px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-accent-cyan" size={22} />
            Full-Stack Architecture Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Interactive MERN & Next.js production design, streaming topologies, and database schemas.
          </p>
        </div>
        <span className="badge-cyber font-mono">Enterprise Ready · v2.4</span>
      </div>

      {/* Live MongoDB Database Status Panel */}
      {dbStatus && (
        <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/[0.03] space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Database size={18} className="text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white font-mono">
                  Live MongoDB Database: <span className="text-emerald-400 font-extrabold">{dbStatus.databaseName}</span>
                </span>
                <span className="text-[11px] text-slate-400 ml-2 font-mono">
                  ({dbStatus.host}:{dbStatus.port})
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              State: Connected (readyState {dbStatus.readyState})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {dbStatus.collections?.map((c) => (
              <div key={c.name} className="p-2.5 rounded-xl bg-base-950/60 border border-white/5 font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">{c.name}</div>
                <div className="text-base font-bold text-white mt-0.5">{c.count} docs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer Hierarchy Cards */}
      <div className="space-y-3">
        {layers.map((layer) => {
          const isSelected = selectedLayer === layer.id;
          return (
            <div
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.02] border-accent-cyan/50 shadow-glow'
                  : 'glass-panel border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${layer.color}`} />
                  <h3 className="text-sm font-bold text-white">{layer.title}</h3>
                </div>
                <span className="text-[11px] font-mono text-accent-cyan px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 self-start sm:self-auto">
                  {layer.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-2 leading-relaxed">{layer.description}</p>
              <div className="text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Tech Stack: </span> {layer.tech}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Production Code Inspector */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-accent-violet" />
            <h3 className="text-sm font-bold text-white">Production Code Inspector</h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {Object.keys(snippets).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedSnippet(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                  selectedSnippet === key
                    ? 'bg-accent-violet/20 border-accent-violet text-white shadow-glow'
                    : 'glass-panel border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {snippets[key].name}
              </button>
            ))}
          </div>
        </div>

        {/* Code View with Copy Button */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <div className="flex items-center justify-between px-4 py-2 bg-base-950/90 border-b border-white/10 text-xs font-mono">
            <span className="text-slate-400">{snippets[selectedSnippet].name}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(snippets[selectedSnippet].code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="hover:text-white flex items-center gap-1"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <SyntaxHighlighter
            language={snippets[selectedSnippet].lang}
            style={atomDark}
            customStyle={{ margin: 0, padding: '1.25rem', background: '#060810', fontSize: '0.8rem' }}
          >
            {snippets[selectedSnippet].code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
