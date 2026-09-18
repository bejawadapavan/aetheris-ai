import React from 'react';
import { motion } from 'framer-motion';
import { PERSONAS } from '../utils/constants.js';

export default function PersonaSwitcher({ value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Persona</p>
      <div className="space-y-1.5">
        {PERSONAS.map((persona) => {
          const Icon = persona.icon;
          const active = value === persona.id;
          return (
            <motion.button
              key={persona.id}
              onClick={() => onChange(persona.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200
                ${
                  active
                    ? 'bg-white/10 border border-accent-violet/40 shadow-glow'
                    : 'border border-transparent hover:bg-white/5'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${persona.color} flex-shrink-0`}
              >
                <Icon size={15} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">{persona.name}</p>
                <p className="text-xs text-slate-500 truncate">{persona.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
