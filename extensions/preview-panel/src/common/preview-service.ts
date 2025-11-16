/**
 * Preview Service
 * Handles communication with preview server
 */

import { injectable } from 'inversify';
import { io, Socket } from 'socket.io-client';

export type PreviewUpdateCallback = (data: { snackUrl: string; files: any }) => void;

@injectable()
export class PreviewService {
  private socket: Socket | null = null;
  private previewServerUrl = 'http://localhost:3002';
  private callbacks: PreviewUpdateCallback[] = [];

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = io(this.previewServerUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to preview server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from preview server');
    });

    this.socket.on('preview-update', (data: any) => {
      console.log('Preview updated:', data);
      this.callbacks.forEach(callback => callback(data));
    });
  }

  /**
   * Register callback for preview updates
   */
  onPreviewUpdate(callback: PreviewUpdateCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Update preview with new code
   */
  async updatePreview(projectId: string, files: Record<string, string>): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to preview server'));
        return;
      }

      this.socket.emit('code-update', { projectId, files }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.snackUrl);
        }
      });
    });
  }

  /**
   * Create new preview
   */
  async createPreview(name: string, files: Record<string, string>): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to preview server'));
        return;
      }

      this.socket.emit('create-preview', { name, files }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.snackUrl);
        }
      });
    });
  }

  /**
   * Disconnect from preview server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
