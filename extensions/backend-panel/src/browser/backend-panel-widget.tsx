/**
 * Backend Panel Widget
 * Displays MCP server connections and database schemas
 */

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core/lib/common/message-service';
import { MCPService } from '../common/mcp-service';

export const BACKEND_PANEL_ID = 'backend-panel';
export const BACKEND_PANEL_LABEL = 'Backend Panel';

interface MCPServer {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  details?: any;
  schema?: any[];
}

@injectable()
export class BackendPanelWidget extends ReactWidget {
  static readonly ID = BACKEND_PANEL_ID;
  static readonly LABEL = BACKEND_PANEL_LABEL;

  @inject(MessageService)
  protected readonly messageService!: MessageService;

  @inject(MCPService)
  protected readonly mcpService!: MCPService;

  protected servers: MCPServer[] = [];
  protected selectedServer: MCPServer | null = null;
  protected isLoading = false;

  @postConstruct()
  protected init(): void {
    this.id = BACKEND_PANEL_ID;
    this.title.label = BACKEND_PANEL_LABEL;
    this.title.caption = BACKEND_PANEL_LABEL;
    this.title.closable = true;
    this.title.iconClass = 'fa fa-database';

    this.update();
    this.loadServers();
  }

  protected async loadServers(): Promise<void> {
    try {
      this.isLoading = true;
      this.update();

      const servers = await this.mcpService.getServers();
      this.servers = servers;

      this.isLoading = false;
      this.update();
    } catch (error: any) {
      this.messageService.error(`Failed to load servers: ${error.message}`);
      this.isLoading = false;
      this.update();
    }
  }

  protected async loadServerSchema(server: MCPServer): Promise<void> {
    try {
      this.isLoading = true;
      this.selectedServer = server;
      this.update();

      const schema = await this.mcpService.getSchema(server.name);
      server.schema = schema;

      this.isLoading = false;
      this.update();
    } catch (error: any) {
      this.messageService.error(`Failed to load schema: ${error.message}`);
      this.isLoading = false;
      this.update();
    }
  }

  protected async generateTypes(server: MCPServer): Promise<void> {
    try {
      await this.mcpService.generateTypes(server.name);
      this.messageService.info(`Generated TypeScript types for ${server.name}`);
    } catch (error: any) {
      this.messageService.error(`Failed to generate types: ${error.message}`);
    }
  }

  protected async generateHooks(server: MCPServer, table: string): Promise<void> {
    try {
      await this.mcpService.generateHooks(server.name, table);
      this.messageService.info(`Generated React hooks for ${table}`);
    } catch (error: any) {
      this.messageService.error(`Failed to generate hooks: ${error.message}`);
    }
  }

  protected renderServerCard(server: MCPServer): React.ReactNode {
    const statusIcon = {
      connected: '🟢',
      disconnected: '🔴',
      error: '🟠',
    }[server.status];

    const serverIcon = {
      bubble: '🫧',
      supabase: '⚡',
      firebase: '🔥',
    }[server.name] || '🗄️';

    return (
      <div
        key={server.name}
        className="server-card"
        onClick={() => this.loadServerSchema(server)}
      >
        <div className="server-header">
          <span className="server-icon">{serverIcon}</span>
          <span className="server-name">{server.name}</span>
          <span className="server-status">{statusIcon}</span>
        </div>
        <div className="server-info">
          {server.details && (
            <>
              {server.details.app && <div>App: {server.details.app}</div>}
              {server.details.url && <div>URL: {server.details.url}</div>}
              {server.details.project && <div>Project: {server.details.project}</div>}
            </>
          )}
        </div>
      </div>
    );
  }

  protected renderSchemaTable(table: any): React.ReactNode {
    return (
      <div key={table.name} className="schema-table">
        <div className="table-header">
          <span className="table-icon">📋</span>
          <span className="table-name">{table.name}</span>
          <button
            className="generate-hooks-button"
            onClick={() => this.selectedServer && this.generateHooks(this.selectedServer, table.name)}
          >
            Generate Hooks
          </button>
        </div>
        <div className="table-fields">
          {table.fields?.map((field: any) => (
            <div key={field.name} className="field-row">
              <span className="field-name">{field.name}</span>
              <span className="field-type">{field.type}</span>
              {field.required && <span className="field-required">required</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  protected render(): React.ReactNode {
    return (
      <div className="backend-panel">
        {/* Header */}
        <div className="panel-header">
          <h3>MCP Backend Servers</h3>
          <button onClick={() => this.loadServers()} disabled={this.isLoading}>
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

        {/* Server List */}
        {!this.selectedServer && !this.isLoading && (
          <div className="servers-list">
            {this.servers.length === 0 ? (
              <div className="empty-state">
                <p>No backend servers configured</p>
                <p className="hint">
                  Configure your MCP servers in .env
                  <br />
                  (Bubble, Supabase, or Firebase)
                </p>
              </div>
            ) : (
              this.servers.map(server => this.renderServerCard(server))
            )}
          </div>
        )}

        {/* Schema View */}
        {this.selectedServer && this.selectedServer.schema && !this.isLoading && (
          <div className="schema-view">
            <div className="schema-header">
              <button
                onClick={() => {
                  this.selectedServer = null;
                  this.update();
                }}
              >
                ← Back to Servers
              </button>
              <h4>{this.selectedServer.name}</h4>
              <button
                className="generate-types-button"
                onClick={() => this.selectedServer && this.generateTypes(this.selectedServer)}
              >
                ✨ Generate All Types
              </button>
            </div>

            <div className="schema-tables">
              {this.selectedServer.schema.map(table => this.renderSchemaTable(table))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
