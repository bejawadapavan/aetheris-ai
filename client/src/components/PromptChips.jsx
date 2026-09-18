import React from 'react';
import { motion } from 'framer-motion';
import { PROMPT_CHIPS } from '../utils/constants.js';

export default function PromptChips({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
      {PROMPT_CHIPS.map((prompt, i) => (
        <motion.button
          key={prompt}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => onSelect(prompt)}
          className="glass-panel rounded-full px-4 py-2 text-sm text-slate-300 hover:text-white
            hover:border-accent-violet/40 hover:shadow-glow transition-all duration-300"
        >
          {prompt}
        </motion.button>
      ))}
    </div>
  );
}
