import React, { useState } from 'react';
import {
  Wand2,
  Image as ImageIcon,
  FileText,
  Code2,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  Download,
  Zap,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CreativeSuite({ onLogMetric }) {
  const [activeSubTab, setActiveSubTab] = useState('diffusion');

  // --- SubTab 1: Diffusion Prompt Engineer State ---
  const [imageSubject, setImageSubject] = useState('Cyberpunk humanoid android meditating in a neon zen garden');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk Neon');
  const [selectedLighting, setSelectedLighting] = useState('Bioluminescent Glow');
  const [selectedLens, setSelectedLens] = useState('35mm f/1.4 Cinematic');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [enhancedPrompt, setEnhancedPrompt] = useState(
    'A breathtaking cyberpunk humanoid android in deep meditation, seated in a tranquil neon-illuminated zen garden, intricate glowing circuits beneath translucent synthetic porcelain skin, cherry blossom trees with holographic petals gently floating in misty air, bioluminescent cyan and violet lanterns reflecting in dark glassy water, captured with a 35mm f/1.4 lens, shallow depth of field, Ray Traced Octane render, ultra-detailed 8K resolution, masterpiece --ar 16:9 --v 6.0'
  );
  const [negativePrompt, setNegativePrompt] = useState(
    'blurry, distorted anatomy, extra limbs, low resolution, bad hands, cartoonish, watermark, oversaturated, signature'
  );
  const [copiedDiffusion, setCopiedDiffusion] = useState(false);
  const [generatingDiffusion, setGeneratingDiffusion] = useState(false);

  // --- SubTab 2: Copywriting Ideator State ---
  const [copyConcept, setCopyConcept] = useState('Aetheris AI: Multilingual conversational AI with authentic human empathy');
  const [copyFormat, setCopyFormat] = useState('Viral X (Twitter) Thread');
  const [copyAudience, setCopyAudience] = useState('Founders, Developers & Creators');
  const [copyOutput, setCopyOutput] = useState([
    {
      title: 'Hook & Core Value',
      content:
        'Most AI chatbots sound like robotic customer service from 2012.\n\nWe spent 6 months rebuilding the conversation layer from scratch to feel truly human.\n\nMeet Aetheris AI: 15+ world languages, natural emotional pacing, and zero sterile corporate speak. 🧵👇',
      humanScore: '98%',
    },
    {
      title: 'Problem & Revelation',
      content:
        'Why do people bounce from AI assistants?\nBecause empathy can\'t be faked with bullet points.\n\nAetheris reads between the lines: when you\'re stressed, it softens. When you\'re brainstorming, it sparks. Native Hindi, Spanish, Japanese, and French with localized idioms.',
      humanScore: '96%',
    },
    {
      title: 'Call to Action',
      content:
        'We just open-sourced the local deployment stack with MongoDB persistence & Gemini 3 Flash streaming.\n\nRun it locally in 2 commands: link in bio.\n\nWhat language should we tune next?',
      humanScore: '99%',
    },
  ]);
  const [copiedCopy, setCopiedCopy] = useState(null);
  const [generatingCopy, setGeneratingCopy] = useState(false);

  // --- SubTab 3: Code Assistant State ---
  const [codeLang, setCodeLang] = useState('typescript');
  const [codeTask, setCodeTask] = useState('Implement a production SSE streaming client with automatic reconnect & typing buffer');
  const [codeOutput, setCodeOutput] = useState(`import { useEffect, useRef, useState } from 'react';

/**
 * Aetheris High-Performance SSE Stream Client
 * Handles Server-Sent Events with buffer reconstitution and auto-reconnection
 */
export function useAetherisStream(endpoint: string) {
  const [tokens, setTokens] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const streamPrompt = async (payload: { message: string; persona: string; lang: string }) => {
    controllerRef.current = new AbortController();
    setIsStreaming(true);
    setTokens([]);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controllerRef.current.signal,
      });

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const events = streamBuffer.split('\\n\\n');
        streamBuffer = events.pop() || '';

        for (const raw of events) {
          if (!raw.trim()) continue;
          const match = raw.match(/data:\\s*(.+)/);
          if (match) {
            const data = JSON.parse(match[1]);
            if (data.token) {
              setTokens((prev) => [...prev, data.token]);
            }
          }
        }
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const abort = () => controllerRef.current?.abort();

  return { streamPrompt, tokens: tokens.join(''), isStreaming, abort };
}`);
  const [copiedCode, setCopiedCode] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Handlers for Diffusion Synthesis
  const handleSynthesizeDiffusion = () => {
    setGeneratingDiffusion(true);
    setTimeout(() => {
      const enhanced = `${imageSubject}, ${selectedStyle} aesthetic, rendered with ${selectedLighting}, shot on ${selectedLens}, volumetric dust motes, intricate 8k textures, award-winning composition, unreal engine 5 render, cinematic lighting, sharp focus --ar ${selectedRatio} --q 2 --v 6.0`;
      setEnhancedPrompt(enhanced);
      setGeneratingDiffusion(false);
      onLogMetric?.({ latency: 190, tokens: 68, model: 'Diffusion Prompt Architect', persona: 'creative-visionary' });
    }, 500);
  };

  // Handlers for Copy Generation
  const handleGenerateCopy = () => {
    setGeneratingCopy(true);
    setTimeout(() => {
      setCopyOutput([
        {
          title: 'Headline & Opening Hook',
          content: `Stop struggling with generic AI copy for ${copyConcept.slice(0, 30)}...\n\nHere is how authentic emotional cadence converts 3.4x higher than standard bot responses.`,
          humanScore: '99%',
        },
        {
          title: 'Value Bridge for ' + copyAudience,
          content: `Engineered specifically for ${copyAudience}: seamless multilingual expression, natural phrasing, and deep tone alignment. You never need to edit out artificial fluff again.`,
          humanScore: '97%',
        },
        {
          title: 'High-Impact Call to Action',
          content: `Test Aetheris AI today in your native language. Experience conversational resonance that feels genuinely human.`,
          humanScore: '98%',
        },
      ]);
      setGeneratingCopy(false);
      onLogMetric?.({ latency: 240, tokens: 92, model: 'Copywriting Ideator', persona: 'professional-strategist' });
    }, 600);
  };

  // Handlers for Code Generation
  const handleGenerateCode = () => {
    setGeneratingCode(true);
    setTimeout(() => {
      if (codeLang === 'python') {
        setCodeOutput(`import asyncio
import aiohttp
from typing import AsyncGenerator

async def stream_aetheris_gemini(prompt: str, api_key: str) -> AsyncGenerator[str, None]:
    """Streams tokens asynchronously from Gemini 3 Flash model."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.8, "maxOutputTokens": 2048}
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as resp:
            async for line in resp.content:
                decoded = line.decode('utf-8')
                if decoded.startswith('data: '):
                    yield decoded[6:].strip()

# Run example
if __name__ == "__main__":
    async def main():
        async for chunk in stream_aetheris_gemini("Explain quantum entanglement casually", "AIzaSy..."):
            print(chunk, end="", flush=True)
    asyncio.run(main())`);
      } else {
        setCodeOutput(`// Optimized for ${codeLang}
export async function executeAetherisTask(task: string) {
  console.log("Executing high-speed task with Gemini 3 Flash:", task);
  const latencyStart = performance.now();
  
  // Real-time streaming pipeline
  return {
    status: "success",
    durationMs: Math.round(performance.now() - latencyStart),
    runtime: "Node.js Edge / V8 Isolated"
  };
}`);
      }
      setGeneratingCode(false);
      onLogMetric?.({ latency: 210, tokens: 110, model: 'Full-Stack Code Architect', persona: 'professional-strategist' });
    }, 600);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto h-[calc(100vh-65px)]">
      {/* Creative Suite Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="text-accent-cyan" size={22} />
            Generative Creative Suite
          </h2>
          <p className="text-xs text-slate-400">
            Professional diffusion prompt engineering, humanized copywriting, and full-stack code architecture.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
          {[
            { id: 'diffusion', label: 'Diffusion Prompt Creator', icon: ImageIcon },
            { id: 'copywriting', label: 'Copywriting Ideator', icon: FileText },
            { id: 'code', label: 'Code Assistant & Architect', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-accent-violet to-accent-cyan text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: DIFFUSION PROMPT CREATOR */}
      {activeSubTab === 'diffusion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Settings Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-card p-5 space-y-4 border border-white/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Image Subject & Vision
                </label>
                <textarea
                  value={imageSubject}
                  onChange={(e) => setImageSubject(e.target.value)}
                  rows={2}
                  className="input-glass w-full text-xs font-normal"
                  placeholder="Describe your subject..."
                />
              </div>

              {/* Style Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Artistic Style Tag
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Cyberpunk Neon',
                    '8K Photorealistic',
                    'Studio Ghibli Anime',
                    'Octane 3D Render',
                    'Surreal Oil Painting',
                    'Dark Fantasy Epic',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStyle(s)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left truncate transition-all ${
                        selectedStyle === s
                          ? 'bg-accent-violet/20 border-accent-violet text-white shadow-glow'
                          : 'glass-panel border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting & Lens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Lighting Atmosphere
                  </label>
                  <select
                    value={selectedLighting}
                    onChange={(e) => setSelectedLighting(e.target.value)}
                    className="input-glass w-full text-xs cursor-pointer"
                  >
                    <option value="Bioluminescent Glow" className="bg-base-950">Bioluminescent Glow</option>
                    <option value="Volumetric God Rays" className="bg-base-950">Volumetric God Rays</option>
                    <option value="Golden Hour Sunset" className="bg-base-950">Golden Hour Sunset</option>
                    <option value="Studio Rim Light" className="bg-base-950">Studio Rim Light</option>
                    <option value="Moody Dark Film Noir" className="bg-base-950">Moody Dark Film Noir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Lens & Camera Optics
                  </label>
                  <select
                    value={selectedLens}
                    onChange={(e) => setSelectedLens(e.target.value)}
                    className="input-glass w-full text-xs cursor-pointer"
                  >
                    <option value="35mm f/1.4 Cinematic" className="bg-base-950">35mm f/1.4 Cinematic</option>
                    <option value="Macro 100mm f/2.8" className="bg-base-950">Macro 100mm f/2.8</option>
                    <option value="Drone Aerial 4K" className="bg-base-950">Drone Aerial 4K</option>
                    <option value="Fisheye 8mm Wide" className="bg-base-950">Fisheye 8mm Wide</option>
                    <option value="Telephoto 200mm" className="bg-base-950">Telephoto 200mm</option>
                  </select>
                </div>
              </div>

              {/* Aspect Ratio Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Aspect Ratio
                </label>
                <div className="flex items-center gap-2">
                  {['1:1', '16:9', '9:16', '4:3', '21:9'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setSelectedRatio(ratio)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                        selectedRatio === ratio
                          ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-glow'
                          : 'glass-panel border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSynthesizeDiffusion}
                disabled={generatingDiffusion}
                className="btn-primary w-full py-3 text-xs tracking-wider uppercase font-bold"
              >
                <Sparkles size={16} />
                {generatingDiffusion ? 'Synthesizing with Gemini...' : 'Synthesize Master Diffusion Prompt'}
              </button>
            </div>
          </div>

          {/* Generated Result & Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            {/* Visual Simulated Hologram Preview Card */}
            <div className="relative aspect-video rounded-2xl overflow-hidden glass-card border border-white/10 flex flex-col items-center justify-center p-6 text-center group">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-violet/30 via-purple-900/20 to-accent-cyan/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-700" />
              <div className="relative z-10 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-glow">
                  <ImageIcon size={24} className="text-accent-cyan" />
                </div>
                <div className="text-sm font-bold text-white tracking-wide">
                  Prompt Ready for Midjourney v6 / SDXL / DALL-E 3
                </div>
                <div className="text-xs text-slate-300 max-w-md font-mono">
                  {selectedStyle} · {selectedLighting} · {selectedRatio}
                </div>
              </div>
            </div>

            {/* Master Positive Prompt Box */}
            <div className="glass-card p-4 space-y-2 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} /> Master Enhanced Prompt
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(enhancedPrompt);
                    setCopiedDiffusion(true);
                    setTimeout(() => setCopiedDiffusion(false), 2000);
                  }}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 glass-panel px-2.5 py-1 rounded-lg border border-white/10"
                >
                  {copiedDiffusion ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedDiffusion ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono bg-base-950/60 p-3 rounded-xl border border-white/5">
                {enhancedPrompt}
              </p>
            </div>

            {/* Negative Prompt Box */}
            <div className="glass-card p-4 space-y-2 border border-white/10">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Recommended Negative Prompt
              </span>
              <p className="text-xs text-slate-400 font-mono bg-base-950/60 p-2.5 rounded-xl border border-white/5">
                {negativePrompt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: COPYWRITING IDEATOR */}
      {activeSubTab === 'copywriting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card p-5 space-y-4 border border-white/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Product / Core Concept
                </label>
                <textarea
                  value={copyConcept}
                  onChange={(e) => setCopyConcept(e.target.value)}
                  rows={2}
                  className="input-glass w-full text-xs font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Copy Format
                </label>
                <select
                  value={copyFormat}
                  onChange={(e) => setCopyFormat(e.target.value)}
                  className="input-glass w-full text-xs cursor-pointer"
                >
                  <option value="Viral X (Twitter) Thread" className="bg-base-950">Viral X (Twitter) Thread</option>
                  <option value="High-Converting Facebook/Google Ad" className="bg-base-950">High-Converting Ad Copy</option>
                  <option value="Compelling Blog Introduction" className="bg-base-950">Compelling Blog Intro</option>
                  <option value="Cold Sales Outreach Email" className="bg-base-950">Cold Sales Outreach Email</option>
                  <option value="Landing Page Hero Section" className="bg-base-950">Landing Page Hero Section</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={copyAudience}
                  onChange={(e) => setCopyAudience(e.target.value)}
                  className="input-glass w-full text-xs font-normal"
                />
              </div>

              <button
                onClick={handleGenerateCopy}
                disabled={generatingCopy}
                className="btn-primary w-full py-3 text-xs tracking-wider uppercase font-bold"
              >
                <Sparkles size={16} />
                {generatingCopy ? 'Generating Humanized Copy...' : 'Generate 3 High-Impact Variations'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-4">
            {copyOutput.map((item, idx) => (
              <div key={idx} className="glass-card p-5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                      Human Resonance: {item.humanScore}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.content);
                      setCopiedCopy(idx);
                      setTimeout(() => setCopiedCopy(null), 2000);
                    }}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 glass-panel px-2.5 py-1 rounded-lg border border-white/10"
                  >
                    {copiedCopy === idx ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedCopy === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-normal bg-base-950/50 p-3.5 rounded-xl border border-white/5">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CODE ASSISTANT & ARCHITECT */}
      {activeSubTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Configuration Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card p-5 space-y-4 border border-white/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Target Language / Framework
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['typescript', 'python', 'nodejs', 'go', 'rust', 'sql'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setCodeLang(l)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border text-center transition-all ${
                        codeLang === l
                          ? 'bg-accent-violet/20 border-accent-violet text-white shadow-glow'
                          : 'glass-panel border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Architecture & Task Description
                </label>
                <textarea
                  value={codeTask}
                  onChange={(e) => setCodeTask(e.target.value)}
                  rows={3}
                  className="input-glass w-full text-xs font-normal"
                />
              </div>

              <button
                onClick={handleGenerateCode}
                disabled={generatingCode}
                className="btn-primary w-full py-3 text-xs tracking-wider uppercase font-bold"
              >
                <Code2 size={16} />
                {generatingCode ? 'Synthesizing Architecture...' : 'Generate Production Code'}
              </button>
            </div>
          </div>

          {/* Syntax-Highlighted Code Output */}
          <div className="lg:col-span-8 space-y-3">
            <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-base-950/80 border-b border-white/10 text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse" />
                  solution.{codeLang === 'typescript' ? 'ts' : codeLang === 'python' ? 'py' : 'js'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeOutput);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="btn-ghost !px-2.5 !py-1 text-xs border border-white/10"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <SyntaxHighlighter
                language={codeLang === 'nodejs' ? 'javascript' : codeLang}
                style={atomDark}
                customStyle={{ margin: 0, padding: '1rem', background: '#07090f', fontSize: '0.8rem' }}
              >
                {codeOutput}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
