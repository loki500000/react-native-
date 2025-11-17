/**
 * Settings Widget
 * Manage API keys and configuration
 */

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core/lib/common/message-service';
import { SettingsService } from '../common/settings-service';

export const SETTINGS_WIDGET_ID = 'settings-widget';
export const SETTINGS_WIDGET_LABEL = 'Settings';

interface Settings {
  figmaToken: string;
  groqApiKey: string;
  groqModel: string;
  bubbleAppName: string;
  bubbleApiToken: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  firebaseProjectId: string;
  firebaseApiKey: string;
}

@injectable()
export class SettingsWidget extends ReactWidget {
  static readonly ID = SETTINGS_WIDGET_ID;
  static readonly LABEL = SETTINGS_WIDGET_LABEL;

  @inject(MessageService)
  protected readonly messageService!: MessageService;

  @inject(SettingsService)
  protected readonly settingsService!: SettingsService;

  protected settings: Settings = {
    figmaToken: '',
    groqApiKey: '',
    groqModel: 'llama-3.1-70b-versatile',
    bubbleAppName: '',
    bubbleApiToken: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    firebaseProjectId: '',
    firebaseApiKey: '',
  };

  protected activeTab: 'general' | 'mcp' | 'advanced' = 'general';
  protected showTokens = false;
  protected isSaving = false;

  @postConstruct()
  protected init(): void {
    this.id = SETTINGS_WIDGET_ID;
    this.title.label = SETTINGS_WIDGET_LABEL;
    this.title.caption = SETTINGS_WIDGET_LABEL;
    this.title.closable = true;
    this.title.iconClass = 'fa fa-cog';

    this.loadSettings();
    this.update();
  }

  protected async loadSettings(): Promise<void> {
    try {
      this.settings = await this.settingsService.getSettings();
      this.update();
    } catch (error: any) {
      this.messageService.error(`Failed to load settings: ${error.message}`);
    }
  }

  protected async saveSettings(): Promise<void> {
    try {
      this.isSaving = true;
      this.update();

      await this.settingsService.saveSettings(this.settings);
      this.messageService.info('Settings saved successfully! Restart services to apply changes.');

      this.isSaving = false;
      this.update();
    } catch (error: any) {
      this.messageService.error(`Failed to save settings: ${error.message}`);
      this.isSaving = false;
      this.update();
    }
  }

  protected updateSetting(key: keyof Settings, value: string): void {
    this.settings[key] = value;
    this.update();
  }

  protected renderInput(
    label: string,
    key: keyof Settings,
    placeholder: string,
    type: 'text' | 'password' = 'text',
    helpText?: string
  ): React.ReactNode {
    const inputType = type === 'password' && !this.showTokens ? 'password' : 'text';

    return (
      <div className="setting-item">
        <label className="setting-label">{label}</label>
        {helpText && <p className="setting-help">{helpText}</p>}
        <input
          type={inputType}
          className="setting-input"
          value={this.settings[key]}
          onChange={(e) => this.updateSetting(key, e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  protected renderGeneralTab(): React.ReactNode {
    return (
      <div className="settings-tab-content">
        <h3>General Settings</h3>

        <div className="settings-section">
          <h4>🎨 Figma Integration</h4>
          {this.renderInput(
            'Figma Personal Access Token',
            'figmaToken',
            'figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'password',
            'Get your token from Figma Settings → Account → Personal access tokens'
          )}
          <a
            href="https://www.figma.com/developers/api#access-tokens"
            target="_blank"
            className="settings-link"
          >
            → Get Figma Token
          </a>
        </div>

        <div className="settings-section">
          <h4>🤖 Groq AI Configuration</h4>
          {this.renderInput(
            'Groq API Key',
            'groqApiKey',
            'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'password',
            'Get your API key from Groq Console'
          )}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            className="settings-link"
          >
            → Get Groq API Key
          </a>

          <div className="setting-item">
            <label className="setting-label">AI Model</label>
            <select
              className="setting-select"
              value={this.settings.groqModel}
              onChange={(e) => this.updateSetting('groqModel', e.target.value)}
            >
              <option value="llama-3.1-70b-versatile">
                Llama 3.1 70B (Recommended)
              </option>
              <option value="llama-3.1-8b-instant">
                Llama 3.1 8B (Faster)
              </option>
              <option value="mixtral-8x7b-32768">
                Mixtral 8x7B
              </option>
            </select>
            <p className="setting-help">
              70B model is best for quality, 8B for speed
            </p>
          </div>
        </div>

        <div className="settings-section">
          <div className="toggle-setting">
            <input
              type="checkbox"
              id="show-tokens"
              checked={this.showTokens}
              onChange={() => {
                this.showTokens = !this.showTokens;
                this.update();
              }}
            />
            <label htmlFor="show-tokens">Show API keys and tokens</label>
          </div>
        </div>
      </div>
    );
  }

  protected renderMCPTab(): React.ReactNode {
    return (
      <div className="settings-tab-content">
        <h3>MCP Backend Integration</h3>
        <p className="tab-description">
          Configure your backend services for database and API integration
        </p>

        <div className="settings-section">
          <h4>🫧 Bubble.io</h4>
          {this.renderInput(
            'App Name',
            'bubbleAppName',
            'your-app-name',
            'text',
            'Your Bubble app name (from the URL)'
          )}
          {this.renderInput(
            'API Token',
            'bubbleApiToken',
            'xxxxxxxxxxxxxxxxxxxxx',
            'password',
            'Get from Bubble Settings → API'
          )}
        </div>

        <div className="settings-section">
          <h4>⚡ Supabase</h4>
          {this.renderInput(
            'Project URL',
            'supabaseUrl',
            'https://xxxxxxxxxxxxx.supabase.co',
            'text',
            'Your Supabase project URL'
          )}
          {this.renderInput(
            'Anon Key',
            'supabaseAnonKey',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            'password',
            'Public anon key (safe for client-side)'
          )}
          <a
            href="https://app.supabase.com"
            target="_blank"
            className="settings-link"
          >
            → Open Supabase Dashboard
          </a>
        </div>

        <div className="settings-section">
          <h4>🔥 Firebase</h4>
          {this.renderInput(
            'Project ID',
            'firebaseProjectId',
            'your-project-id',
            'text',
            'Your Firebase project ID'
          )}
          {this.renderInput(
            'API Key',
            'firebaseApiKey',
            'xxxxxxxxxxxxxxxxxxxxx',
            'password',
            'Web API key from Firebase console'
          )}
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            className="settings-link"
          >
            → Open Firebase Console
          </a>
        </div>
      </div>
    );
  }

  protected renderAdvancedTab(): React.ReactNode {
    return (
      <div className="settings-tab-content">
        <h3>Advanced Settings</h3>

        <div className="settings-section">
          <h4>🔧 System Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">IDE Server:</span>
              <span className="info-value">http://localhost:3000</span>
            </div>
            <div className="info-item">
              <span className="info-label">AI Engine:</span>
              <span className="info-value">http://localhost:3001</span>
            </div>
            <div className="info-item">
              <span className="info-label">Preview Server:</span>
              <span className="info-value">http://localhost:3002</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4>📦 Configuration File</h4>
          <p className="setting-help">
            Settings are stored in <code>.env</code> file in the project root.
            You can also edit this file directly.
          </p>
          <button
            className="secondary-button"
            onClick={() =>
              this.messageService.info(
                'Edit .env file in your project root directory'
              )
            }
          >
            📄 View .env Location
          </button>
        </div>

        <div className="settings-section">
          <h4>🔄 Restart Services</h4>
          <p className="setting-help">
            After changing settings, restart the services to apply changes:
          </p>
          <div className="button-group">
            <button className="secondary-button">
              Stop Services
            </button>
            <button className="secondary-button">
              Start Services
            </button>
          </div>
          <p className="setting-help">
            Or run: <code>./scripts/stop.sh && ./scripts/dev.sh</code>
          </p>
        </div>
      </div>
    );
  }

  protected render(): React.ReactNode {
    return (
      <div className="settings-widget">
        {/* Header */}
        <div className="settings-header">
          <h2>⚙️ Figma Studio AI Settings</h2>
          <button
            className="save-button"
            onClick={() => this.saveSettings()}
            disabled={this.isSaving}
          >
            {this.isSaving ? '💾 Saving...' : '💾 Save Settings'}
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${this.activeTab === 'general' ? 'active' : ''}`}
            onClick={() => {
              this.activeTab = 'general';
              this.update();
            }}
          >
            General
          </button>
          <button
            className={`tab-button ${this.activeTab === 'mcp' ? 'active' : ''}`}
            onClick={() => {
              this.activeTab = 'mcp';
              this.update();
            }}
          >
            MCP Backends
          </button>
          <button
            className={`tab-button ${this.activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => {
              this.activeTab = 'advanced';
              this.update();
            }}
          >
            Advanced
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {this.activeTab === 'general' && this.renderGeneralTab()}
          {this.activeTab === 'mcp' && this.renderMCPTab()}
          {this.activeTab === 'advanced' && this.renderAdvancedTab()}
        </div>
      </div>
    );
  }
}
