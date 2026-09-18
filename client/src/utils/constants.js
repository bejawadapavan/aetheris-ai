import { Heart, Briefcase, Sparkles } from 'lucide-react';

export const PERSONAS = [
  {
    id: 'empathetic-friend',
    name: 'Empathetic Friend',
    description: 'Warm, casual, and emotionally in tune',
    icon: Heart,
    color: 'from-pink-500 to-rose-400',
  },
  {
    id: 'professional-strategist',
    name: 'Professional Strategist',
    description: 'Sharp, structured, and direct',
    icon: Briefcase,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'creative-visionary',
    name: 'Creative Visionary',
    description: 'Imaginative, vivid, and inspiring',
    icon: Sparkles,
    color: 'from-violet-500 to-fuchsia-500',
  },
];

export const LANGUAGES = [
  { code: 'auto', label: 'Auto-detect' },
  { code: 'English', label: 'English' },
  { code: 'Spanish', label: 'Español' },
  { code: 'Hindi', label: 'हिन्दी' },
  { code: 'French', label: 'Français' },
  { code: 'German', label: 'Deutsch' },
  { code: 'Japanese', label: '日本語' },
  { code: 'Arabic', label: 'العربية' },
  { code: 'Mandarin Chinese', label: '中文' },
  { code: 'Portuguese', label: 'Português' },
  { code: 'Russian', label: 'Русский' },
];

export const PROMPT_CHIPS = [
  "I'm feeling a bit overwhelmed today",
  'Help me plan my week',
  'Give me a creative story idea',
  'Explain a complex topic simply',
  "What's a good way to start a hard conversation?",
  'Brainstorm a business idea with me',
];
