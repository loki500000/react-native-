/**
 * AI Service
 * Handles communication with AI engine via WebSocket
 */

import { injectable } from 'inversify';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface AIResponse {
  content: string;
  files?: GeneratedFile[];
}

export type AgentType = 'orchestrator' | 'designer' | 'backend' | 'developer';

@injectable()
export class AIService {
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

    this.socket.on('error', (error: any) => {
      console.error('AI engine error:', error);
    });
  }

  /**
   * Send chat message to AI agent
   */
  async chat(
    agent: AgentType,
    prompt: string,
    options?: {
      conversationHistory?: Message[];
      context?: any;
    }
  ): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to AI engine'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('AI request timeout'));
      }, 60000); // 60 second timeout

      this.socket.emit('chat', {
        agent,
        prompt,
        history: options?.conversationHistory || [],
        context: options?.context,
      }, (response: any) => {
        clearTimeout(timeout);

        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve({
            content: response.content,
            files: response.files,
          });
        }
      });
    });
  }

  /**
   * Stream chat response (for real-time updates)
   */
  async *chatStream(
    agent: AgentType,
    prompt: string,
    options?: {
      conversationHistory?: Message[];
      context?: any;
    }
  ): AsyncGenerator<string> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to AI engine');
    }

    const streamId = Date.now().toString();

    this.socket.emit('chat-stream', {
      streamId,
      agent,
      prompt,
      history: options?.conversationHistory || [],
      context: options?.context,
    });

    // Listen for stream chunks
    const chunkHandler = (data: any) => {
      if (data.streamId === streamId) {
        return data.chunk;
      }
    };

    this.socket.on('stream-chunk', chunkHandler);

    // Wait for completion
    await new Promise<void>((resolve) => {
      this.socket!.on('stream-complete', (data: any) => {
        if (data.streamId === streamId) {
          this.socket!.off('stream-chunk', chunkHandler);
          resolve();
        }
      });
    });
  }

  /**
   * Apply generated files to workspace
   */
  async applyFiles(files: GeneratedFile[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to AI engine'));
        return;
      }

      this.socket.emit('apply-files', { files }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get available MCP servers
   */
  async getMCPServers(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to AI engine'));
        return;
      }

      this.socket.emit('get-mcp-servers', {}, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.servers);
        }
      });
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
