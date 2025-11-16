/**
 * Figma Service
 * Handles Figma API interactions and code generation
 */

import { injectable } from 'inversify';
import axios, { AxiosInstance } from 'axios';

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

@injectable()
export class FigmaService {
  private client: AxiosInstance;
  private apiToken: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from settings
    this.loadToken();
  }

  private loadToken(): void {
    // TODO: Load from Theia preferences
    this.apiToken = process.env.FIGMA_TOKEN || '';

    if (this.apiToken) {
      this.client.defaults.headers.common['X-Figma-Token'] = this.apiToken;
    }
  }

  public setToken(token: string): void {
    this.apiToken = token;
    this.client.defaults.headers.common['X-Figma-Token'] = token;
  }

  /**
   * Get recent Figma files
   */
  async getRecentFiles(): Promise<FigmaFile[]> {
    if (!this.apiToken) {
      throw new Error('Figma token not configured');
    }

    const response = await this.client.get('/me');
    const userId = response.data.id;

    const filesResponse = await this.client.get(`/users/${userId}/files`);

    return filesResponse.data.files.map((file: any) => ({
      key: file.key,
      name: file.name,
      thumbnail_url: file.thumbnail_url,
      last_modified: file.last_modified,
    }));
  }

  /**
   * Get file document structure
   */
  async getFile(fileKey: string): Promise<FigmaNode> {
    if (!this.apiToken) {
      throw new Error('Figma token not configured');
    }

    const response = await this.client.get(`/files/${fileKey}`);
    return this.convertToNode(response.data.document);
  }

  /**
   * Get specific nodes from file
   */
  async getNodes(fileKey: string, nodeIds: string[]): Promise<any[]> {
    if (!this.apiToken) {
      throw new Error('Figma token not configured');
    }

    const idsParam = nodeIds.join(',');
    const response = await this.client.get(`/files/${fileKey}/nodes?ids=${idsParam}`);

    return Object.values(response.data.nodes);
  }

  /**
   * Generate React Native code from selected nodes
   */
  async generateCode(fileKey: string, nodeIds: string[]): Promise<void> {
    // Get node data
    const nodes = await this.getNodes(fileKey, nodeIds);

    // Send to AI engine for code generation
    // TODO: Integrate with AI engine via WebSocket
    const aiEngineUrl = 'http://localhost:3001/generate';

    await axios.post(aiEngineUrl, {
      fileKey,
      nodes,
      targetFramework: 'react-native',
      styleType: 'stylesheet',
    });
  }

  /**
   * Convert Figma node to simplified tree structure
   */
  private convertToNode(figmaNode: any): FigmaNode {
    const node: FigmaNode = {
      id: figmaNode.id,
      name: figmaNode.name,
      type: figmaNode.type,
    };

    if (figmaNode.children && figmaNode.children.length > 0) {
      node.children = figmaNode.children.map((child: any) =>
        this.convertToNode(child)
      );
    }

    return node;
  }
}
