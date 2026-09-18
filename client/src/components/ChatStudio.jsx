import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Globe,
  HeartHandshake,
  Briefcase,
  Smile,
  Coffee,
  Trash2,
  Clock,
  Terminal,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PERSONAS, WORLD_LANGUAGES, generateStudioResponse } from '../services/geminiService.js';

export default function ChatStudio({
  language,
  setLanguage,
  audioEnabled,
  currentModel,
  onLogMetric,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm **Aetheris**, your multilingual, emotionally attuned AI conversational studio. I can converse in 15+ world languages, adapt to distinct human personas, and assist with complex creative or architectural tasks. How can I accompany you today?",
      latency: 180,
      tokens: 42,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState('empathetic-friend');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const activePersonaObj = PERSONAS.find((p) => p.id === persona) || PERSONAS[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Web Speech synthesis reader
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // strip markdown symbols
    const cleanText = text.replace(/[*_#`~[\]]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // map language code to voice locale
    const localeMap = {
      hi: 'hi-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      zh: 'zh-CN',
      ar: 'ar-SA',
      pt: 'pt-BR',
      it: 'it-IT',
      ru: 'ru-RU',
      ko: 'ko-KR',
      en: 'en-US',
    };
    utterance.lang = localeMap[language] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (customPrompt) => {
    const promptToSend = (customPrompt ?? input).trim();
    if (!promptToSend || isStreaming) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMessage = {
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);

    // Placeholder assistant message
    const assistantIndex = newMessages.length;
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        latency: 0,
        tokens: 0,
        streaming: true,
        timestamp: Date.now(),
      },
    ]);

    try {
      const result = await generateStudioResponse({
        message: promptToSend,
        history: messages,
        persona,
        language,
        model: currentModel,
        onToken: (token) => {
          setMessages((prev) => {
            const next = [...prev];
            const current = next[assistantIndex];
            if (current) {
              next[assistantIndex] = {
                ...current,
                content: current.content + token,
              };
            }
            return next;
          });
        },
      });

      setMessages((prev) => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            ...next[assistantIndex],
            content: result.content,
            latency: result.latency,
            tokens: result.tokens,
            streaming: false,
          };
        }
        return next;
      });

      // Speak if audio is enabled
      if (audioEnabled) {
        speakText(result.content);
      }

      // Log metrics to analytics
      onLogMetric?.({
        latency: result.latency,
        tokens: result.tokens,
        persona,
        language,
        model: result.model,
        timestamp: Date.now(),
      });
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            ...next[assistantIndex],
            content: `⚠️ Could not complete request: ${err.message}`,
            streaming: false,
          };
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const handleClear = () => {
    if (window.confirm('Reset conversation history?')) {
      setMessages([]);
    }
  };

  const quickPills = [
    { label: '🌟 Deep Empathy', prompt: 'I feel overwhelmed with decisions lately. Can you talk through this with me?' },
    { label: '🇮🇳 Hindi Conversation', prompt: 'नमस्ते! क्या आप मुझे भविष्य की जनरेटिव एआई तकनीक के बारे में समझा सकते हैं?' },
    { label: '🇪🇸 Spanish Creative', prompt: 'Escribe una metáfora poética sobre la inteligencia humana y las estrellas.' },
    { label: '⚡ Strategy Blueprint', prompt: 'Act as a top-tier advisor and give me a 3-step launch strategy for a micro-SaaS.' },
    { label: '🎭 Witty Observation', prompt: 'Give me a clever, humorous reflection on how humans use coffee to function.' },
  ];

  const getPersonaIcon = (id) => {
    switch (id) {
      case 'empathetic-friend':
        return HeartHandshake;
      case 'professional-strategist':
        return Briefcase;
      case 'witty-playful':
        return Smile;
      case 'casual-friendly':
        return Coffee;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-65px)] w-full overflow-hidden">
      {/* Sub-Header: Persona & Tone Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-2.5 glass-panel border-b border-white/[0.06] z-10 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mr-1">
            Tone Persona:
          </span>
          {PERSONAS.map((p) => {
            const Icon = getPersonaIcon(p.id);
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-accent-violet to-accent-cyan text-white shadow-glow'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/5'
                }`}
                title={p.description}
              >
                <Icon size={14} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Message Stream Viewport */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-accent-violet via-purple-500 to-accent-cyan flex items-center justify-center shadow-glow mb-4">
              <Sparkles size={32} className="text-white animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              Conversational Studio Ready
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Experience empathetic, human-like resonance across 15+ world languages.
              Powered by high-speed Gemini integration and persistent memory.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickPills.map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(pill.prompt)}
                  className="px-3.5 py-2 rounded-xl glass-card text-xs font-medium text-slate-300 hover:text-white hover:border-accent-cyan/40 transition-all shadow-sm"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group animate-fadeIn`}
                >
                  {/* Sender tag & latency pill */}
                  <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] font-mono text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'You' : 'Aetheris AI'}
                    </span>
                    {!isUser && m.latency > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-accent-cyan bg-accent-cyan/10 px-2 py-0.2 rounded-full border border-accent-cyan/20">
                        <Zap size={10} /> {m.latency}ms · ~{m.tokens} tokens
                      </span>
                    )}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`relative max-w-2xl md:max-w-3xl rounded-2xl p-4 md:p-5 text-sm leading-relaxed transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-accent-violet/90 to-purple-600/90 text-white rounded-br-none shadow-glow'
                        : 'glass-card text-slate-100 rounded-bl-none border border-white/10'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <div className="rounded-xl overflow-hidden my-3 border border-white/10">
                                  <div className="bg-base-950/80 px-4 py-1.5 text-[11px] font-mono text-slate-400 border-b border-white/10 flex items-center justify-between">
                                    <span>{match[1]}</span>
                                    <button
                                      onClick={() => handleCopy(String(children), `code-${idx}`)}
                                      className="hover:text-white"
                                    >
                                      {copiedIdx === `code-${idx}` ? 'Copied!' : 'Copy Code'}
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={atomDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, background: '#080a11' }}
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                        {m.streaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-accent-cyan animate-pulse align-middle" />
                        )}
                      </div>
                    )}

                    {/* Bottom Actions for AI responses */}
                    {!isUser && !m.streaming && (
                      <div className="flex items-center gap-3 pt-3 mt-3 border-t border-white/[0.06] text-xs text-slate-400">
                        <button
                          onClick={() => handleCopy(m.content, idx)}
                          className="hover:text-white flex items-center gap-1 transition-colors"
                          title="Copy message"
                        >
                          {copiedIdx === idx ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => speakText(m.content)}
                          className="hover:text-white flex items-center gap-1 transition-colors"
                          title="Speak out loud"
                        >
                          <Volume2 size={13} />
                          <span>Speak</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer & Quick Pills */}
      <div className="p-4 md:px-8 border-t border-white/[0.08] glass-panel">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Prompt inspiration row if messages > 0 */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase whitespace-nowrap">
                Pills:
              </span>
              {quickPills.slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white text-[11px] whitespace-nowrap border border-white/5 transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Text Input Container */}
          <div className="glass-card rounded-2xl p-2.5 flex items-end gap-2 border border-white/15 focus-within:border-accent-cyan/50 focus-within:ring-2 focus-within:ring-accent-cyan/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const el = textareaRef.current;
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message Aetheris in ${WORLD_LANGUAGES.find((l) => l.code === language)?.name || 'any language'}...`}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none px-3 py-2 text-sm text-slate-100 placeholder-slate-500 max-h-36 font-normal"
            />

            {isStreaming ? (
              <button
                onClick={() => setIsStreaming(false)}
                className="btn-primary !bg-red-500/80 hover:!bg-red-600 p-2.5 rounded-xl text-white shadow-none"
                title="Stop generating"
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="btn-primary p-2.5 rounded-xl flex-shrink-0"
                title="Send Message"
              >
                <Send size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 font-mono">
            <span>Powered by Gemini 3 Flash & Neural Multilingual Engine</span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
