import React, { useState } from 'react';
import ParticleCanvas from './components/ParticleCanvas.jsx';
import HeaderNav from './components/HeaderNav.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';
import ChatStudio from './components/ChatStudio.jsx';
import CreativeSuite from './components/CreativeSuite.jsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';
import ArchitectureExplorer from './components/ArchitectureExplorer.jsx';
import { getStoredModel } from './services/geminiService.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [currentModel, setCurrentModel] = useState(getStoredModel());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [metrics, setMetrics] = useState([]);

  const handleLogMetric = (newMetric) => {
    setMetrics((prev) => [newMetric, ...prev].slice(0, 50));
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-base-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Neo-Cyber Ambient Background & Glow */}
      <div className="ambient-glow" />
      <ParticleCanvas />

      {/* Main Studio Interface */}
      <div className="relative z-10 flex flex-col h-full w-full">
        <HeaderNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled((prev) => !prev)}
          language={language}
          onLanguageChange={setLanguage}
          currentModel={currentModel}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' && (
            <ChatStudio
              language={language}
              setLanguage={setLanguage}
              audioEnabled={audioEnabled}
              currentModel={currentModel}
              onLogMetric={handleLogMetric}
            />
          )}

          {activeTab === 'creative' && (
            <CreativeSuite onLogMetric={handleLogMetric} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard metrics={metrics} />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureExplorer />
          )}
        </main>
      </div>

      {/* AI Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onModelChange={(newModel) => setCurrentModel(newModel)}
      />
    </div>
  );
}
