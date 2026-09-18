import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { LANGUAGES } from '../utils/constants.js';

export default function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === value) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1 mb-2">Language</p>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5
          bg-white/5 border border-white/10 hover:border-accent-cyan/40 transition-all duration-200"
      >
        <span className="flex items-center gap-2 text-sm text-slate-200">
          <Globe size={15} className="text-accent-cyan" />
          {current.label}
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full max-h-56 overflow-y-auto rounded-xl glass-panel
            shadow-glass py-1"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150
                ${
                  lang.code === value
                    ? 'text-accent-cyan bg-white/5'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
