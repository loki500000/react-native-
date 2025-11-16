/**
 * Figma API client utilities
 */

import axios, { AxiosInstance } from 'axios';

export class FigmaAPI {
  private client: AxiosInstance;
  private baseURL = 'https://api.figma.com/v1';

  constructor(private token: string) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Figma-Token': this.token,
      },
    });
  }

  /**
   * Get a Figma file by ID
   */
  async getFile(fileId: string): Promise<any> {
    try {
      const response = await this.client.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Figma file: ${error}`);
    }
  }

  /**
   * Get specific nodes from a Figma file
   */
  async getNodes(fileId: string, nodeIds: string[]): Promise<any> {
    try {
      const ids = nodeIds.join(',');
      const response = await this.client.get(`/files/${fileId}/nodes?ids=${ids}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Figma nodes: ${error}`);
    }
  }

  /**
   * Get image URLs for nodes
   */
  async getImages(fileId: string, nodeIds: string[], format: 'jpg' | 'png' | 'svg' = 'png', scale: number = 2): Promise<Record<string, string>> {
    try {
      const ids = nodeIds.join(',');
      const response = await this.client.get(`/images/${fileId}?ids=${ids}&format=${format}&scale=${scale}`);
      return response.data.images;
    } catch (error) {
      throw new Error(`Failed to fetch Figma images: ${error}`);
    }
  }

  /**
   * Get design tokens (styles) from a Figma file
   */
  async getStyles(fileId: string): Promise<any> {
    try {
      const response = await this.client.get(`/files/${fileId}/styles`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Figma styles: ${error}`);
    }
  }

  /**
   * Get file components
   */
  async getComponents(fileId: string): Promise<any> {
    try {
      const response = await this.client.get(`/files/${fileId}/components`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Figma components: ${error}`);
    }
  }
}
