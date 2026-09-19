import React, { useState, useEffect } from 'react';
import ParticleCanvas from './components/ParticleCanvas.jsx';
import HeaderNav from './components/HeaderNav.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';
import LoginView from './components/LoginView.jsx';
import ChatStudio from './components/ChatStudio.jsx';
import CreativeSuite from './components/CreativeSuite.jsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';
import ArchitectureExplorer from './components/ArchitectureExplorer.jsx';
import { getStoredModel } from './services/geminiService.js';
import { isUserAuthenticated, getStoredUser, logout } from './services/authService.js';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(isUserAuthenticated());
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [activeTab, setActiveTab] = useState('chat');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [currentModel, setCurrentModel] = useState(getStoredModel());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    setIsAuthenticated(isUserAuthenticated());
    setCurrentUser(getStoredUser());
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActiveTab('chat');
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleLogMetric = (newMetric) => {
    setMetrics((prev) => [newMetric, ...prev].slice(0, 50));
    fetch('/api/database/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMetric),
    }).catch(() => {});
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-base-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Neo-Cyber Ambient Background & Glow */}
      <div className="ambient-glow" />
      <ParticleCanvas />

      {!isAuthenticated ? (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* Main Studio Interface */
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
            currentUser={currentUser}
            onLogout={handleLogout}
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
      )}

      {/* AI Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onModelChange={(newModel) => setCurrentModel(newModel)}
      />
    </div>
  );
}
