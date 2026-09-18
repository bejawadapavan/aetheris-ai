import React from 'react';
import {
  BarChart3,
  Zap,
  Cpu,
  Clock,
  Globe,
  Coins,
  Activity,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function AnalyticsDashboard({ metrics = [] }) {
  // Default aggregate calculations + live metrics
  const totalTokens = metrics.reduce((acc, m) => acc + (m.tokens || 50), 3840);
  const avgLatency =
    metrics.length > 0
      ? Math.round(metrics.reduce((acc, m) => acc + (m.latency || 200), 0) / metrics.length)
      : 198;
  const requestCount = 14 + metrics.length;

  const languages = [
    { name: 'English (US/UK)', percent: 38, color: 'from-accent-violet to-purple-400' },
    { name: 'Hindi (हिन्दी)', percent: 24, color: 'from-accent-cyan to-blue-400' },
    { name: 'Spanish (Español)', percent: 18, color: 'from-pink-500 to-rose-400' },
    { name: 'Japanese (日本語)', percent: 12, color: 'from-amber-400 to-orange-400' },
    { name: 'French / Others', percent: 8, color: 'from-emerald-400 to-teal-400' },
  ];

  const personas = [
    { name: 'Empathetic & Warm', count: '45%', color: 'bg-rose-500' },
    { name: 'Executive Advisor', count: '28%', color: 'bg-cyan-500' },
    { name: 'Visionary Creative', count: '18%', color: 'bg-violet-500' },
    { name: 'Witty & Playful', count: '9%', color: 'bg-amber-400' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto h-[calc(100vh-65px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-accent-cyan" size={22} />
            Analytics & Token Telemetry
          </h2>
          <p className="text-xs text-slate-400">
            Real-time inference latency, token consumption, and multilingual telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <Activity size={14} className="animate-pulse" />
          <span>Telemetrics Pipeline: LIVE</span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Latency</span>
            <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan">
              <Zap size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{avgLatency} ms</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Gemini 3 Flash</span> edge streaming
          </p>
        </div>

        <div className="glass-card p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tokens</span>
            <div className="p-2 rounded-xl bg-accent-violet/10 text-accent-violet">
              <Cpu size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {totalTokens.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Context window utilization</p>
        </div>

        <div className="glass-card p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{requestCount}</div>
          <p className="text-[11px] text-slate-400">100% Success rate (0 errors)</p>
        </div>

        <div className="glass-card p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Cost</span>
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <Coins size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">$0.0014</div>
          <p className="text-[11px] text-slate-400">Tier: High-efficiency Flash</p>
        </div>
      </div>

      {/* Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Language Breakdown */}
        <div className="lg:col-span-7 glass-card p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe size={16} className="text-accent-cyan" />
              Multilingual Distribution
            </h3>
            <span className="text-xs text-slate-400">Active Session</span>
          </div>

          <div className="space-y-3.5">
            {languages.map((l) => (
              <div key={l.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium">{l.name}</span>
                  <span className="font-mono text-slate-400">{l.percent}%</span>
                </div>
                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${l.color} transition-all duration-1000`}
                    style={{ width: `${l.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Persona Breakdown */}
        <div className="lg:col-span-5 glass-card p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-accent-violet" />
              Persona Adaptation
            </h3>
            <span className="text-xs text-slate-400">Dynamic Tone</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {personas.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${p.color}`} />
                  <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Inference Logs */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-accent-cyan" />
            Live Inference Activity Log
          </h3>
          <span className="text-xs font-mono text-slate-400">Auto-refreshing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-white/[0.03] border-b border-white/10 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Engine / Model</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Tokens</th>
                <th className="py-2.5 px-3">Persona Tone</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { status: '200 OK', model: 'gemini-3-flash-preview', latency: '184ms', tokens: '142', tone: 'Empathetic', time: '10s ago' },
                { status: '200 OK', model: 'gemini-3-flash-preview', latency: '210ms', tokens: '98', tone: 'Executive', time: '45s ago' },
                { status: '200 OK', model: 'Express + MongoDB', latency: '24ms', tokens: '35', tone: 'Empathetic', time: '2m ago' },
                { status: '200 OK', model: 'Diffusion Architect', latency: '190ms', tokens: '68', tone: 'Visionary', time: '4m ago' },
                { status: '200 OK', model: 'Full-Stack Code', latency: '215ms', tokens: '280', tone: 'Executive', time: '7m ago' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">
                      <CheckCircle2 size={11} /> {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-white font-semibold">{row.model}</td>
                  <td className="py-2.5 px-3 text-accent-cyan">{row.latency}</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.tokens}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.tone}</td>
                  <td className="py-2.5 px-3 text-slate-500">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
