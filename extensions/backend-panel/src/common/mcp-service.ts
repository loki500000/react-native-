/**
 * MCP Service
 * Handles communication with MCP backend servers
 */

import { injectable } from 'inversify';
import { io, Socket } from 'socket.io-client';

export interface MCPServer {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  details?: any;
  schema?: any[];
}

@injectable()
export class MCPService {
  private socket: Socket | null = null;
  private aiEngineUrl = 'http://localhost:3001';

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = io(this.aiEngineUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to AI engine');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from AI engine');
    });
  }

  /**
   * Get list of available MCP servers
   */
  async getServers(): Promise<MCPServer[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to AI engine'));
        return;
      }

      this.socket.emit('get-mcp-servers', {}, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.servers || []);
        }
      });
    });
  }

  /**
   * Get schema for a specific server
   */
  async getSchema(serverName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to AI engine'));
        return;
      }

      this.socket.emit('get-schema', { serverName }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.schema || []);
        }
      });
    });
  }

  /**
   * Generate TypeScript types from schema
   */
  async generateTypes(serverName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to AI engine'));
        return;
      }

      this.socket.emit('generate-types', { serverName }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Generate React hooks for a table
   */
  async generateHooks(serverName: string, tableName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to AI engine'));
        return;
      }

      this.socket.emit(
        'generate-hooks',
        { serverName, tableName },
        (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Disconnect from AI engine
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
