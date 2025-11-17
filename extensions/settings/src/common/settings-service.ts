/**
 * Settings Service
 * Manages application settings and .env file
 */

import { injectable } from 'inversify';
import * as fs from 'fs';
import * as path from 'path';

export interface Settings {
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
export class SettingsService {
  private envPath: string;

  constructor() {
    // Find .env file in project root
    this.envPath = this.findEnvFile();
  }

  private findEnvFile(): string {
    // Try common locations
    const locations = [
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '..', '.env'),
      path.join(process.cwd(), '..', '..', '.env'),
    ];

    for (const location of locations) {
      if (fs.existsSync(location)) {
        return location;
      }
    }

    // Default to project root
    return path.join(process.cwd(), '..', '.env');
  }

  /**
   * Get current settings from .env file
   */
  async getSettings(): Promise<Settings> {
    try {
      if (!fs.existsSync(this.envPath)) {
        // Return defaults if no .env exists
        return this.getDefaultSettings();
      }

      const envContent = fs.readFileSync(this.envPath, 'utf-8');
      const settings = this.parseEnv(envContent);

      return settings;
    } catch (error) {
      console.error('Error reading settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save settings to .env file
   */
  async saveSettings(settings: Settings): Promise<void> {
    try {
      // Read existing .env or create new
      let envContent = '';
      if (fs.existsSync(this.envPath)) {
        envContent = fs.readFileSync(this.envPath, 'utf-8');
      }

      // Update values
      envContent = this.updateEnvContent(envContent, settings);

      // Write back
      fs.writeFileSync(this.envPath, envContent, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  private getDefaultSettings(): Settings {
    return {
      figmaToken: process.env.FIGMA_TOKEN || '',
      groqApiKey: process.env.GROQ_API_KEY || '',
      groqModel: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
      bubbleAppName: process.env.BUBBLE_APP_NAME || '',
      bubbleApiToken: process.env.BUBBLE_API_TOKEN || '',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
    };
  }

  private parseEnv(content: string): Settings {
    const settings = this.getDefaultSettings();

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();

      switch (key.trim()) {
        case 'FIGMA_TOKEN':
          settings.figmaToken = value;
          break;
        case 'GROQ_API_KEY':
          settings.groqApiKey = value;
          break;
        case 'GROQ_MODEL':
          settings.groqModel = value;
          break;
        case 'BUBBLE_APP_NAME':
          settings.bubbleAppName = value;
          break;
        case 'BUBBLE_API_TOKEN':
          settings.bubbleApiToken = value;
          break;
        case 'SUPABASE_URL':
          settings.supabaseUrl = value;
          break;
        case 'SUPABASE_ANON_KEY':
          settings.supabaseAnonKey = value;
          break;
        case 'FIREBASE_PROJECT_ID':
          settings.firebaseProjectId = value;
          break;
        case 'FIREBASE_API_KEY':
          settings.firebaseApiKey = value;
          break;
      }
    }

    return settings;
  }

  private updateEnvContent(content: string, settings: Settings): string {
    const updates: Record<string, string> = {
      FIGMA_TOKEN: settings.figmaToken,
      GROQ_API_KEY: settings.groqApiKey,
      GROQ_MODEL: settings.groqModel,
      BUBBLE_APP_NAME: settings.bubbleAppName,
      BUBBLE_API_TOKEN: settings.bubbleApiToken,
      SUPABASE_URL: settings.supabaseUrl,
      SUPABASE_ANON_KEY: settings.supabaseAnonKey,
      FIREBASE_PROJECT_ID: settings.firebaseProjectId,
      FIREBASE_API_KEY: settings.firebaseApiKey,
    };

    let lines = content.split('\n');

    // Update existing keys or add new ones
    for (const [key, value] of Object.entries(updates)) {
      const lineIndex = lines.findIndex((line) =>
        line.trim().startsWith(`${key}=`)
      );

      if (lineIndex >= 0) {
        // Update existing
        lines[lineIndex] = `${key}=${value}`;
      } else {
        // Add new
        lines.push(`${key}=${value}`);
      }
    }

    return lines.join('\n');
  }
}
