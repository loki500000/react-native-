/**
 * Supabase MCP Server
 * Connects AI to Supabase for database integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

class SupabaseMCPServer {
  private server: Server;
  private supabase: SupabaseClient;
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig) {
    this.config = config;
    this.supabase = createClient(config.url, config.serviceKey || config.anonKey);

    this.server = new Server(
      {
        name: 'supabase-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_schema',
          description: 'Get database schema (tables, columns, relationships)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'query_table',
          description: 'Query data from a table',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              select: { type: 'string', description: 'Columns to select (default: *)' },
              filter: { type: 'object', description: 'Filter conditions' },
              limit: { type: 'number', description: 'Limit results' },
            },
            required: ['table'],
          },
        },
        {
          name: 'insert_data',
          description: 'Insert data into a table',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              data: { type: 'object' },
            },
            required: ['table', 'data'],
          },
        },
        {
          name: 'update_data',
          description: 'Update data in a table',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              id: { type: 'string' },
              data: { type: 'object' },
            },
            required: ['table', 'id', 'data'],
          },
        },
        {
          name: 'delete_data',
          description: 'Delete data from a table',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              id: { type: 'string' },
            },
            required: ['table', 'id'],
          },
        },
        {
          name: 'generate_types',
          description: 'Generate TypeScript types from database schema',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'generate_hooks',
          description: 'Generate React hooks for a table',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
            },
            required: ['table'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_schema':
            return await this.getSchema();
          case 'query_table':
            return await this.queryTable(args.table, args);
          case 'insert_data':
            return await this.insertData(args.table, args.data);
          case 'update_data':
            return await this.updateData(args.table, args.id, args.data);
          case 'delete_data':
            return await this.deleteData(args.table, args.id);
          case 'generate_types':
            return await this.generateTypes();
          case 'generate_hooks':
            return await this.generateHooks(args.table);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  private async getSchema() {
    // Note: This requires service_role key for introspection
    const { data, error } = await this.supabase.rpc('get_schema_info');

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }

  private async queryTable(table: string, options: any) {
    let query = this.supabase.from(table).select(options.select || '*');

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }

  private async insertData(table: string, data: any) {
    const { data: result, error } = await this.supabase.from(table).insert(data).select();

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }

  private async updateData(table: string, id: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    if (error) throw error;

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }

  private async deleteData(table: string, id: string) {
    const { error } = await this.supabase.from(table).delete().eq('id', id);

    if (error) throw error;

    return {
      content: [{ type: 'text', text: 'Deleted successfully' }],
    };
  }

  private async generateTypes() {
    // Generate TypeScript types from schema
    const typescript = `
// Auto-generated types from Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      // Add more tables...
    };
  };
}
    `.trim();

    return {
      content: [{ type: 'text', text: typescript }],
    };
  }

  private async generateHooks(table: string) {
    const hookCode = `
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Database } from './types';

type ${table}Row = Database['public']['Tables']['${table}']['Row'];

export function use${capitalize(table)}() {
  const [data, setData] = useState<${table}Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('${table}_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: '${table}' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('${table}')
      .select('*');

    if (error) {
      setError(error);
    } else {
      setData(data || []);
    }
    setLoading(false);
  };

  return { data, loading, error, refetch: fetchData };
}
    `.trim();

    return {
      content: [{ type: 'text', text: hookCode }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Supabase MCP server running on stdio');
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Start server
const config: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_KEY,
};

const server = new SupabaseMCPServer(config);
server.run().catch(console.error);
