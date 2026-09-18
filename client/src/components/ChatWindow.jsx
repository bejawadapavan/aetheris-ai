import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Send, Square, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import PromptChips from './PromptChips.jsx';
import AudioToggle, { speak } from './AudioToggle.jsx';
import useChatStore from '../store/useChatStore.js';
import { useStreamChat } from '../hooks/useStreamChat.js';

export default function ChatWindow() {
  const { messages, isStreaming, sidebarOpen, toggleSidebar, audioEnabled, toggleAudio, language } =
    useChatStore();
  const { sendMessage, stopStreaming } = useStreamChat();

  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    const value = (text ?? input).trim();
    if (!value || isStreaming) return;
    sendMessage(value);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  };

  return (
    <div className="relative flex flex-col h-full flex-1 min-w-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10 glass-panel z-10">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button onClick={toggleSidebar} className="btn-ghost !p-2">
              <Menu size={18} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-medium text-slate-200">Nova</span>
          </div>
        </div>
        <AudioToggle enabled={audioEnabled} onToggle={toggleAudio} />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-cyan
                flex items-center justify-center shadow-glow"
            >
              <Sparkles size={28} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100 mb-1.5">
                What's on your mind?
              </h1>
              <p className="text-slate-500 text-sm max-w-md">
                Speak in any language — I'll understand and reply in kind.
              </p>
            </div>
            <PromptChips onSelect={handleSend} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, idx) => (
              <MessageBubble
                key={idx}
                message={message}
                audioEnabled={audioEnabled}
                onSpeak={(text) => speak(text, language)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="px-4 md:px-8 pb-6 pt-2">
        <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-accent-violet/40 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message Nova..."
            className="flex-1 bg-transparent resize-none outline-none px-3 py-2.5 text-slate-100
              placeholder-slate-500 max-h-40"
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="btn-primary !bg-none !bg-red-500/80 hover:!shadow-none flex-shrink-0"
              title="Stop generating"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="btn-primary flex-shrink-0"
              title="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          Nova can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
