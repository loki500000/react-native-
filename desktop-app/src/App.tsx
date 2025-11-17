/**
 * Desktop App Main Component
 * Embeds Theia IDE in Tauri window
 */

import React, { useState, useEffect } from 'react';
import './App.css';

const THEIA_URL = 'http://localhost:3000';
const AI_ENGINE_URL = 'http://localhost:3001';
const PREVIEW_SERVER_URL = 'http://localhost:3002';

interface ServiceStatus {
  ide: 'running' | 'stopped' | 'checking';
  ai: 'running' | 'stopped' | 'checking';
  preview: 'running' | 'stopped' | 'checking';
}

function App() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    ide: 'checking',
    ai: 'checking',
    preview: 'checking',
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkServices = async () => {
    const newStatus: ServiceStatus = {
      ide: 'stopped',
      ai: 'stopped',
      preview: 'stopped',
    };

    // Check IDE
    try {
      const response = await fetch(THEIA_URL, { method: 'HEAD', mode: 'no-cors' });
      newStatus.ide = 'running';
    } catch {
      newStatus.ide = 'stopped';
    }

    // Check AI Engine
    try {
      const response = await fetch(`${AI_ENGINE_URL}/health`);
      if (response.ok) {
        newStatus.ai = 'running';
      }
    } catch {
      newStatus.ai = 'stopped';
    }

    // Check Preview Server
    try {
      const response = await fetch(PREVIEW_SERVER_URL, { method: 'HEAD', mode: 'no-cors' });
      newStatus.preview = 'running';
    } catch {
      newStatus.preview = 'stopped';
    }

    setServiceStatus(newStatus);
  };

  const allServicesRunning = () => {
    return (
      serviceStatus.ide === 'running' &&
      serviceStatus.ai === 'running' &&
      serviceStatus.preview === 'running'
    );
  };

  const getStatusIcon = (status: 'running' | 'stopped' | 'checking') => {
    switch (status) {
      case 'running':
        return '🟢';
      case 'stopped':
        return '🔴';
      case 'checking':
        return '🟡';
    }
  };

  return (
    <div className="app">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="app-title">
          <span className="app-icon">🎨</span>
          <span>Figma Studio AI</span>
        </div>

        <div className="service-indicators">
          <div className="service-status" title="IDE Server">
            {getStatusIcon(serviceStatus.ide)} IDE
          </div>
          <div className="service-status" title="AI Engine">
            {getStatusIcon(serviceStatus.ai)} AI
          </div>
          <div className="service-status" title="Preview Server">
            {getStatusIcon(serviceStatus.preview)} Preview
          </div>
        </div>

        <button
          className="settings-button"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Main Content */}
      {allServicesRunning() ? (
        <iframe
          src={THEIA_URL}
          className="theia-iframe"
          title="Figma Studio AI IDE"
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups"
        />
      ) : (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>🎨 Welcome to Figma Studio AI</h1>
            <p className="welcome-subtitle">
              AI-powered IDE for converting Figma designs to React Native code
            </p>

            <div className="service-check">
              <h3>Service Status:</h3>
              <div className="service-list">
                <div className={`service-item ${serviceStatus.ide === 'running' ? 'running' : ''}`}>
                  {getStatusIcon(serviceStatus.ide)} Theia IDE (port 3000)
                  {serviceStatus.ide === 'stopped' && (
                    <span className="status-detail">Not running</span>
                  )}
                </div>
                <div className={`service-item ${serviceStatus.ai === 'running' ? 'running' : ''}`}>
                  {getStatusIcon(serviceStatus.ai)} AI Engine (port 3001)
                  {serviceStatus.ai === 'stopped' && (
                    <span className="status-detail">Not running</span>
                  )}
                </div>
                <div className={`service-item ${serviceStatus.preview === 'running' ? 'running' : ''}`}>
                  {getStatusIcon(serviceStatus.preview)} Preview Server (port 3002)
                  {serviceStatus.preview === 'stopped' && (
                    <span className="status-detail">Not running</span>
                  )}
                </div>
              </div>
            </div>

            <div className="startup-instructions">
              <h3>To start the services:</h3>
              <div className="code-block">
                <code>./scripts/dev.sh</code>
              </div>
              <p className="instruction-note">
                Run this command in your terminal from the project root directory
              </p>
            </div>

            <div className="quick-links">
              <h3>Quick Links:</h3>
              <a href="https://github.com/yourrepo" target="_blank" rel="noopener noreferrer">
                📚 Documentation
              </a>
              <a href={THEIA_URL} target="_blank" rel="noopener noreferrer">
                🌐 Open IDE in Browser
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>⚙️ Settings</h2>
              <button className="close-button" onClick={() => setShowSettings(false)}>
                ✕
              </button>
            </div>
            <div className="settings-content">
              <div className="setting-group">
                <h3>Service URLs</h3>
                <div className="setting-item">
                  <label>IDE Server:</label>
                  <input type="text" value={THEIA_URL} readOnly />
                </div>
                <div className="setting-item">
                  <label>AI Engine:</label>
                  <input type="text" value={AI_ENGINE_URL} readOnly />
                </div>
                <div className="setting-item">
                  <label>Preview Server:</label>
                  <input type="text" value={PREVIEW_SERVER_URL} readOnly />
                </div>
              </div>

              <div className="setting-group">
                <h3>About</h3>
                <p>Figma Studio AI v1.0.0</p>
                <p>Built with Tauri, React, and Theia</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
