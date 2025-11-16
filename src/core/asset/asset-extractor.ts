/**
 * Extract and download assets from Figma
 */

import { FigmaAPI } from '../../utils/figma-api';
import { Asset } from '../../types';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export class AssetExtractor {
  private assets: Asset[] = [];

  constructor(private api: FigmaAPI) {}

  /**
   * Extract all assets from a node tree
   */
  async extractAssets(node: any, fileId: string): Promise<Asset[]> {
    this.assets = [];
    await this.traverseNode(node, fileId);
    return this.assets;
  }

  /**
   * Traverse node tree and collect image nodes
   */
  private async traverseNode(node: any, fileId: string): Promise<void> {
    // Check if node has image fills
    if (node.fills && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'IMAGE' && fill.visible !== false && fill.imageRef) {
          const asset: Asset = {
            id: node.id,
            name: this.sanitizeName(node.name),
            type: 'image',
            url: '', // Will be fetched
          };
          this.assets.push(asset);
        }
      }
    }

    // Check if node is a vector that should be exported as SVG
    if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
      const asset: Asset = {
        id: node.id,
        name: this.sanitizeName(node.name),
        type: 'svg',
        url: '', // Will be fetched
      };
      this.assets.push(asset);
    }

    // Recursively traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        await this.traverseNode(child, fileId);
      }
    }
  }

  /**
   * Download assets to output directory
   */
  async downloadAssets(fileId: string, outputPath: string): Promise<Asset[]> {
    if (this.assets.length === 0) {
      return [];
    }

    // Create assets directory
    const assetsDir = path.join(outputPath, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Get image URLs from Figma API
    const imageNodeIds = this.assets
      .filter(a => a.type === 'image')
      .map(a => a.id);

    const svgNodeIds = this.assets
      .filter(a => a.type === 'svg')
      .map(a => a.id);

    // Fetch PNG images
    if (imageNodeIds.length > 0) {
      const imageUrls = await this.api.getImages(fileId, imageNodeIds, 'png', 2);

      for (const asset of this.assets.filter(a => a.type === 'image')) {
        const url = imageUrls[asset.id];
        if (url) {
          asset.url = url;
          const fileName = `${asset.name}.png`;
          const filePath = path.join(assetsDir, fileName);

          await this.downloadFile(url, filePath);
          asset.localPath = `./assets/${fileName}`;
        }
      }
    }

    // Fetch SVG vectors
    if (svgNodeIds.length > 0) {
      const svgUrls = await this.api.getImages(fileId, svgNodeIds, 'svg', 1);

      for (const asset of this.assets.filter(a => a.type === 'svg')) {
        const url = svgUrls[asset.id];
        if (url) {
          asset.url = url;
          const fileName = `${asset.name}.svg`;
          const filePath = path.join(assetsDir, fileName);

          await this.downloadFile(url, filePath);
          asset.localPath = `./assets/${fileName}`;
        }
      }
    }

    return this.assets;
  }

  /**
   * Download a file from URL
   */
  private async downloadFile(url: string, filePath: string): Promise<void> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      fs.writeFileSync(filePath, response.data);
    } catch (error) {
      console.error(`Failed to download ${url}:`, error);
    }
  }

  /**
   * Sanitize asset name for file system
   */
  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Generate asset import statements
   */
  generateAssetImports(assets: Asset[]): string[] {
    return assets.map(asset => {
      const varName = this.toVariableName(asset.name);
      return `import ${varName} from '${asset.localPath}';`;
    });
  }

  /**
   * Convert asset name to valid variable name
   */
  private toVariableName(name: string): string {
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
    return sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
  }
}
