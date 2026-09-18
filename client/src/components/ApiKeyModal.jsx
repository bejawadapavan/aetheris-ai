import React, { useState } from 'react';
import { X, Key, Check, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import {
  SUPPORTED_MODELS,
  getStoredGeminiKey,
  setStoredGeminiKey,
  getStoredModel,
  setStoredModel,
} from '../services/geminiService.js';

export default function ApiKeyModal({ isOpen, onClose, onModelChange }) {
  const [apiKey, setApiKey] = useState(getStoredGeminiKey());
  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiKey(apiKey);
    setStoredModel(selectedModel);
    onModelChange?.(selectedModel);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestKey = async () => {
    if (!apiKey) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello! Respond with: "API Connected Successfully"' }] }],
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.candidates) {
        setTestResult({
          success: true,
          message: 'Connection verified! Gemini API is active & responding.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error?.message || 'Invalid API Key or permission denied.',
        });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Network error testing API.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card p-6 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center text-white shadow-glow">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">AI Engine & API Settings</h2>
              <p className="text-xs text-slate-400">Configure live Gemini 3 Flash or autonomous mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-5">
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Conversational Engine Model
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SUPPORTED_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedModel === m.id
                      ? 'bg-accent-violet/15 border-accent-violet/60 shadow-glow'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      {m.name}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {m.provider}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-mono">
                    {m.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gemini API Key input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
              >
                Get free key <ExternalLink size={11} />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy... (leave blank to use autonomous neural fallback)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-glass w-full text-sm font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              Your API key is saved exclusively in your browser's secure local storage.
            </p>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.success ? <Check size={14} /> : <X size={14} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={handleTestKey}
            disabled={testing || !apiKey}
            className="btn-ghost text-xs px-3 py-2 border border-white/10 disabled:opacity-40"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-ghost text-xs px-3 py-2">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary text-xs px-4 py-2">
              {saved ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : (
                <>
                  <Zap size={14} /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
