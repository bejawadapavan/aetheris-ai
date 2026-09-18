import React from 'react';
import {
  Sparkles,
  MessageSquare,
  Wand2,
  BarChart3,
  Layers,
  Settings,
  Volume2,
  VolumeX,
  Globe,
  Radio,
} from 'lucide-react';
import { WORLD_LANGUAGES } from '../services/geminiService.js';

export default function HeaderNav({
  activeTab,
  onTabChange,
  audioEnabled,
  onToggleAudio,
  language,
  onLanguageChange,
  currentModel,
  onOpenSettings,
}) {
  const currentLangObj = WORLD_LANGUAGES.find((l) => l.code === language) || WORLD_LANGUAGES[0];

  const tabs = [
    { id: 'chat', label: 'Conversational Studio', icon: MessageSquare, badge: 'Live AI' },
    { id: 'creative', label: 'Generative Creative Suite', icon: Wand2, badge: 'Diffusion & Code' },
    { id: 'analytics', label: 'Analytics & Tokens', icon: BarChart3, badge: 'Metrics' },
    { id: 'architecture', label: 'Full-Stack Architecture', icon: Layers, badge: 'MERN/Next' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] px-4 md:px-6 py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-violet via-purple-500 to-accent-cyan shadow-glow p-0.5">
              <div className="w-full h-full bg-base-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={20} className="text-accent-cyan animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  Aetheris <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-violet">AI</span>
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
                  Studio v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Multilingual Human Conversational Studio
              </p>
            </div>
          </div>

          {/* Mobile settings trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="btn-ghost !p-2 border border-white/10"
              title="API Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-violet/30 to-accent-cyan/20 border border-accent-cyan/40 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-accent-cyan' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Controls & Status */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Active Model Pill */}
          <div
            onClick={onOpenSettings}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-white/10 hover:border-accent-cyan/40 text-xs transition-colors"
            title="Click to configure Gemini API Key & Model"
          >
            <Radio size={13} className="text-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">
              {currentModel === 'gemini-3-flash-preview'
                ? 'gemini-3-flash'
                : currentModel === 'backend-proxy'
                ? 'Express + Mongo'
                : 'Neural Simulated'}
            </span>
          </div>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel border border-white/10 text-xs text-slate-300">
              <Globe size={14} className="text-accent-violet" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
              >
                {WORLD_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-base-950 text-slate-200">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Web Speech Voice Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              audioEnabled
                ? 'bg-accent-violet/20 border-accent-violet/50 text-accent-violet shadow-glow'
                : 'glass-panel border-white/10 text-slate-400 hover:text-white'
            }`}
            title={audioEnabled ? 'Voice Narrator Active (Web Speech)' : 'Voice Narrator Muted'}
          >
            {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="font-mono">{audioEnabled ? 'Voice ON' : 'Mute'}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="btn-ghost !p-2 rounded-xl border border-white/10 hover:border-accent-violet/50"
            title="Configure API Keys & Engine"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
