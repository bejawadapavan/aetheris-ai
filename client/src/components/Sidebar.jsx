import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, X, Sparkles } from 'lucide-react';
import PersonaSwitcher from './PersonaSwitcher.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import useChatStore from '../store/useChatStore.js';
import { useConversations } from '../hooks/useConversations.js';

export default function Sidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    persona,
    setPersona,
    language,
    setLanguage,
    activeConversationId,
    startNewConversation,
  } = useChatStore();

  const { conversations, openConversation, removeConversation } = useConversations();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="fixed md:relative z-30 w-[280px] h-full flex flex-col
            glass-panel border-r border-white/10 p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center shadow-glow">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Nova</span>
            </div>
            <button onClick={toggleSidebar} className="btn-ghost !p-1.5 md:hidden">
              <X size={18} />
            </button>
          </div>

          {/* New chat */}
          <button
            onClick={startNewConversation}
            className="btn-primary w-full mb-5 !py-2.5 text-sm"
          >
            <Plus size={16} />
            New conversation
          </button>

          {/* Persona + language */}
          <div className="space-y-5 mb-5">
            <PersonaSwitcher value={persona} onChange={setPersona} />
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          <div className="h-px bg-white/10 mb-3" />

          {/* Conversation history */}
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1 mb-2">
            History
          </p>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {conversations.length === 0 && (
              <p className="text-xs text-slate-600 px-2 py-4 text-center">
                No conversations yet
              </p>
            )}
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200
                  ${
                    conv._id === activeConversationId
                      ? 'bg-white/10 border border-accent-violet/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                onClick={() => openConversation(conv._id)}
              >
                <MessageSquare size={14} className="text-slate-500 flex-shrink-0" />
                <span className="text-sm text-slate-300 truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeConversation(conv._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all duration-150"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
