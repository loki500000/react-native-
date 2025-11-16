/**
 * Figma Explorer Widget
 * Displays Figma files and allows multi-selection for code generation
 */

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core/lib/common/message-service';
import { FigmaService } from '../common/figma-service';

export const FIGMA_EXPLORER_ID = 'figma-explorer';
export const FIGMA_EXPLORER_LABEL = 'Figma Explorer';

interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

@injectable()
export class FigmaExplorerWidget extends ReactWidget {
  static readonly ID = FIGMA_EXPLORER_ID;
  static readonly LABEL = FIGMA_EXPLORER_LABEL;

  @inject(MessageService)
  protected readonly messageService!: MessageService;

  @inject(FigmaService)
  protected readonly figmaService!: FigmaService;

  protected files: FigmaFile[] = [];
  protected selectedFile: FigmaFile | null = null;
  protected fileNodes: FigmaNode | null = null;
  protected selectedNodes: Set<string> = new Set();
  protected isLoading = false;

  @postConstruct()
  protected init(): void {
    this.id = FIGMA_EXPLORER_ID;
    this.title.label = FIGMA_EXPLORER_LABEL;
    this.title.caption = FIGMA_EXPLORER_LABEL;
    this.title.closable = true;
    this.title.iconClass = 'fa fa-figma';

    this.update();
    this.loadRecentFiles();
  }

  protected async loadRecentFiles(): Promise<void> {
    try {
      this.isLoading = true;
      this.update();

      const files = await this.figmaService.getRecentFiles();
      this.files = files;

      this.isLoading = false;
      this.update();
    } catch (error: any) {
      this.messageService.error(`Failed to load Figma files: ${error.message}`);
      this.isLoading = false;
      this.update();
    }
  }

  protected async loadFile(file: FigmaFile): Promise<void> {
    try {
      this.isLoading = true;
      this.selectedFile = file;
      this.update();

      const document = await this.figmaService.getFile(file.key);
      this.fileNodes = document;
      this.selectedNodes.clear();

      this.isLoading = false;
      this.update();
    } catch (error: any) {
      this.messageService.error(`Failed to load file: ${error.message}`);
      this.isLoading = false;
      this.update();
    }
  }

  protected toggleNodeSelection(nodeId: string): void {
    if (this.selectedNodes.has(nodeId)) {
      this.selectedNodes.delete(nodeId);
    } else {
      this.selectedNodes.add(nodeId);
    }
    this.update();
  }

  protected async generateCode(): Promise<void> {
    if (this.selectedNodes.size === 0) {
      this.messageService.warn('Please select at least one node to generate code');
      return;
    }

    if (!this.selectedFile) {
      return;
    }

    try {
      this.isLoading = true;
      this.update();

      const nodeIds = Array.from(this.selectedNodes);
      await this.figmaService.generateCode(this.selectedFile.key, nodeIds);

      this.messageService.info(`Generated code for ${nodeIds.length} components`);
      this.isLoading = false;
      this.update();
    } catch (error: any) {
      this.messageService.error(`Code generation failed: ${error.message}`);
      this.isLoading = false;
      this.update();
    }
  }

  protected renderNode(node: FigmaNode, depth: number = 0): React.ReactNode {
    const isSelected = this.selectedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = depth * 20;

    return (
      <div key={node.id}>
        <div
          className={`figma-node ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => this.toggleNodeSelection(node.id)}
        >
          {hasChildren && <span className="node-icon">📁</span>}
          {!hasChildren && <span className="node-icon">📄</span>}
          <span className="node-name">{node.name}</span>
          <span className="node-type">{node.type}</span>
        </div>
        {hasChildren && (
          <div className="node-children">
            {node.children!.map(child => this.renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  protected render(): React.ReactNode {
    return (
      <div className="figma-explorer">
        {/* Header */}
        <div className="explorer-header">
          <h3>Figma Files</h3>
          <button onClick={() => this.loadRecentFiles()} disabled={this.isLoading}>
            🔄 Refresh
          </button>
        </div>

        {/* Loading */}
        {this.isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* File List */}
        {!this.selectedFile && !this.isLoading && (
          <div className="file-list">
            {this.files.length === 0 ? (
              <div className="empty-state">
                <p>No recent Figma files found</p>
                <p className="hint">Make sure your Figma token is configured in Settings</p>
              </div>
            ) : (
              this.files.map(file => (
                <div
                  key={file.key}
                  className="file-item"
                  onClick={() => this.loadFile(file)}
                >
                  <img src={file.thumbnail_url} alt={file.name} className="file-thumbnail" />
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-modified">
                      Modified: {new Date(file.last_modified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* File Tree */}
        {this.selectedFile && this.fileNodes && !this.isLoading && (
          <div className="file-tree">
            <div className="tree-header">
              <button onClick={() => {
                this.selectedFile = null;
                this.fileNodes = null;
                this.selectedNodes.clear();
                this.update();
              }}>
                ← Back to Files
              </button>
              <h4>{this.selectedFile.name}</h4>
            </div>

            <div className="tree-nodes">
              {this.renderNode(this.fileNodes)}
            </div>

            <div className="tree-footer">
              <div className="selection-info">
                {this.selectedNodes.size} nodes selected
              </div>
              <button
                className="generate-button"
                onClick={() => this.generateCode()}
                disabled={this.selectedNodes.size === 0}
              >
                ✨ Generate Code
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
