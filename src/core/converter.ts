/**
 * Main converter orchestrator
 * Coordinates parsing, transformation, and code generation
 */

import { FigmaAPI } from '../utils/figma-api';
import { NodeParser } from './parser/node-parser';
import { TokenExtractor } from './parser/token-extractor';
import { StyleSheetGenerator } from './generator/stylesheet-generator';
import { StyledComponentsGenerator } from './generator/styled-components-generator';
import { GeneratorConfig, GeneratorOutput, GeneratedComponent } from '../types';

export class FigmaConverter {
  private api: FigmaAPI;
  private parser: NodeParser;
  private tokenExtractor: TokenExtractor;

  constructor(
    private token: string,
    private config: GeneratorConfig
  ) {
    this.api = new FigmaAPI(token);
    this.parser = new NodeParser();
    this.tokenExtractor = new TokenExtractor();
  }

  /**
   * Convert Figma file to React Native code
   */
  async convert(fileId: string, nodeIds?: string[]): Promise<GeneratorOutput> {
    // Fetch Figma file
    const figmaFile = await this.api.getFile(fileId);

    // If specific nodes requested, fetch them
    let nodes: any[];
    if (nodeIds && nodeIds.length > 0) {
      const nodesData = await this.api.getNodes(fileId, nodeIds);
      nodes = Object.values(nodesData.nodes).map((n: any) => n.document);
    } else {
      // Use top-level frames from first page
      nodes = figmaFile.document.children[0].children.filter(
        (node: any) => node.type === 'FRAME' || node.type === 'COMPONENT'
      );
    }

    // Parse nodes
    const parsedNodes = nodes.map(node => this.parser.parse(node));

    // Generate components
    const components: GeneratedComponent[] = [];

    for (const node of parsedNodes) {
      if (node.isComponent) {
        const component = this.generateComponent(node);
        components.push(component);
      }
    }

    // Extract design tokens if requested
    let designTokens;
    if (this.config.designTokens) {
      designTokens = this.tokenExtractor.extractTokens(figmaFile);
    }

    // Generate index file
    const indexCode = this.generateIndexFile(components);

    // Handle assets if requested
    const assets: any[] = [];
    if (this.config.extractAssets) {
      // TODO: Implement asset extraction
      // This would involve finding image nodes and downloading them
    }

    return {
      components,
      designTokens,
      assets,
      index: indexCode,
    };
  }

  /**
   * Generate code for a single component
   */
  private generateComponent(node: any): GeneratedComponent {
    let generator;

    switch (this.config.styleType) {
      case 'styled-components':
        generator = new StyledComponentsGenerator();
        break;
      case 'stylesheet':
      default:
        generator = new StyleSheetGenerator();
        break;
    }

    return generator.generate(node, this.config.typescript);
  }

  /**
   * Generate index file that exports all components
   */
  private generateIndexFile(components: GeneratedComponent[]): string {
    const exports = components.map(c => {
      const ext = this.config.typescript ? 'tsx' : 'jsx';
      return `export { ${c.name} } from './${c.name}';`;
    }).join('\n');

    return `/**
 * Auto-generated index file
 * Exports all components
 */

${exports}
`;
  }

  /**
   * Get Figma file metadata
   */
  async getFileInfo(fileId: string): Promise<any> {
    const file = await this.api.getFile(fileId);
    return {
      name: file.name,
      lastModified: file.lastModified,
      version: file.version,
      thumbnailUrl: file.thumbnailUrl,
    };
  }

  /**
   * Get available components in a file
   */
  async getComponents(fileId: string): Promise<any> {
    return await this.api.getComponents(fileId);
  }
}
