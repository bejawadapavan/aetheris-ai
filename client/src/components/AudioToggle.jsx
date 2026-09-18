import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={enabled ? 'Voice playback on' : 'Voice playback off'}
      className={`btn-ghost !px-2.5 ${enabled ? 'text-accent-cyan' : ''}`}
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}

/**
 * Speaks the given text aloud using the browser's built-in Web Speech API.
 * Silently no-ops in environments without speech synthesis support.
 */
export function speak(text, lang) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    text.replace(/[*_`#>]/g, '').replace(/\n+/g, ' ')
  );

  const langMap = {
    Spanish: 'es-ES',
    Hindi: 'hi-IN',
    French: 'fr-FR',
    German: 'de-DE',
    Japanese: 'ja-JP',
    Arabic: 'ar-SA',
    'Mandarin Chinese': 'zh-CN',
    Portuguese: 'pt-PT',
    Russian: 'ru-RU',
    English: 'en-US',
  };

  utterance.lang = langMap[lang] || 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
