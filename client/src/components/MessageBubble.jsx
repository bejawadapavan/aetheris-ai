import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Volume2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer.jsx';
import TypingIndicator from './TypingIndicator.jsx';

export default function MessageBubble({ message, onSpeak, audioEnabled }) {
  const isUser = message.role === 'user';
  const isEmpty = !message.content && message.streaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
          ${isUser ? 'bg-gradient-to-br from-cyan-500 to-blue-500' : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'}
          shadow-glow`}
      >
        {isUser ? <User size={17} className="text-white" /> : <Bot size={17} className="text-white" />}
      </div>

      <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`glass-panel rounded-2xl px-4 py-3 ${
            isUser
              ? 'rounded-tr-sm bg-gradient-to-br from-accent-cyan/10 to-accent-violet/5'
              : 'rounded-tl-sm'
          }`}
        >
          {isEmpty ? (
            <TypingIndicator />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {!isUser && !isEmpty && audioEnabled && (
          <button
            onClick={() => onSpeak(message.content)}
            className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 hover:text-accent-cyan transition-colors"
            title="Play audio"
          >
            <Volume2 size={13} />
            <span>Listen</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
