/**
 * Bubble.io MCP Server
 * Connects AI to Bubble.io backend for full-stack development
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

interface BubbleConfig {
  appName: string;
  apiToken: string;
  version?: string;
}

interface BubbleDataType {
  name: string;
  fields: BubbleField[];
}

interface BubbleField {
  name: string;
  type: string;
  is_list: boolean;
  required: boolean;
}

class BubbleMCPServer {
  private server: Server;
  private client: AxiosInstance;
  private config: BubbleConfig;

  constructor(config: BubbleConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `https://${config.appName}.bubbleapps.io/${config.version || 'version-test'}/api/1.1`,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.server = new Server(
      {
        name: 'bubble-mcp-server',
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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_data_types',
          description: 'Get all data types (tables) from Bubble app',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_data',
          description: 'Fetch data from a Bubble data type',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: {
                type: 'string',
                description: 'The data type name (e.g., "User", "Post")',
              },
              constraints: {
                type: 'array',
                description: 'Optional constraints for filtering',
                items: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    constraint_type: { type: 'string' },
                    value: { type: 'string' },
                  },
                },
              },
            },
            required: ['dataType'],
          },
        },
        {
          name: 'create_data',
          description: 'Create new entry in Bubble data type',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: {
                type: 'string',
                description: 'The data type name',
              },
              data: {
                type: 'object',
                description: 'The data to create',
              },
            },
            required: ['dataType', 'data'],
          },
        },
        {
          name: 'update_data',
          description: 'Update existing entry in Bubble',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: {
                type: 'string',
                description: 'The data type name',
              },
              id: {
                type: 'string',
                description: 'The unique ID of the entry',
              },
              data: {
                type: 'object',
                description: 'The fields to update',
              },
            },
            required: ['dataType', 'id', 'data'],
          },
        },
        {
          name: 'delete_data',
          description: 'Delete entry from Bubble',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: {
                type: 'string',
                description: 'The data type name',
              },
              id: {
                type: 'string',
                description: 'The unique ID of the entry',
              },
            },
            required: ['dataType', 'id'],
          },
        },
        {
          name: 'generate_types',
          description: 'Generate TypeScript types from Bubble schema',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'generate_hooks',
          description: 'Generate React hooks for Bubble data types',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: {
                type: 'string',
                description: 'The data type name',
              },
            },
            required: ['dataType'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_data_types':
            return await this.getDataTypes();

          case 'get_data':
            return await this.getData(args.dataType, args.constraints);

          case 'create_data':
            return await this.createData(args.dataType, args.data);

          case 'update_data':
            return await this.updateData(args.dataType, args.id, args.data);

          case 'delete_data':
            return await this.deleteData(args.dataType, args.id);

          case 'generate_types':
            return await this.generateTypes();

          case 'generate_hooks':
            return await this.generateHooks(args.dataType);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Get all data types from Bubble
   */
  private async getDataTypes() {
    // Note: Bubble doesn't have a direct API endpoint for schema
    // This would need to be configured manually or via Bubble API documentation
    // For now, return example structure

    const dataTypes: BubbleDataType[] = [
      {
        name: 'User',
        fields: [
          { name: 'email', type: 'text', is_list: false, required: true },
          { name: 'name', type: 'text', is_list: false, required: false },
          { name: 'avatar_url', type: 'image', is_list: false, required: false },
          { name: 'created_date', type: 'date', is_list: false, required: true },
        ],
      },
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(dataTypes, null, 2),
        },
      ],
    };
  }

  /**
   * Fetch data from Bubble
   */
  private async getData(dataType: string, constraints?: any[]) {
    const params: any = {};

    if (constraints) {
      constraints.forEach((constraint, index) => {
        params[`constraints[${index}][key]`] = constraint.key;
        params[`constraints[${index}][constraint_type]`] = constraint.constraint_type;
        params[`constraints[${index}][value]`] = constraint.value;
      });
    }

    const response = await this.client.get(`/obj/${dataType}`, { params });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Create data in Bubble
   */
  private async createData(dataType: string, data: any) {
    const response = await this.client.post(`/obj/${dataType}`, data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Update data in Bubble
   */
  private async updateData(dataType: string, id: string, data: any) {
    const response = await this.client.patch(`/obj/${dataType}/${id}`, data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Delete data from Bubble
   */
  private async deleteData(dataType: string, id: string) {
    const response = await this.client.delete(`/obj/${dataType}/${id}`);

    return {
      content: [
        {
          type: 'text',
          text: 'Deleted successfully',
        },
      ],
    };
  }

  /**
   * Generate TypeScript types from Bubble schema
   */
  private async generateTypes() {
    const dataTypes = await this.getDataTypes();
    const types = JSON.parse(dataTypes.content[0].text as string);

    let typescript = '// Auto-generated types from Bubble.io\n\n';

    types.forEach((dataType: BubbleDataType) => {
      typescript += `export interface ${dataType.name} {\n`;
      typescript += `  _id: string;\n`;

      dataType.fields.forEach((field) => {
        const optional = field.required ? '' : '?';
        const typeStr = this.mapBubbleTypeToTS(field.type, field.is_list);
        typescript += `  ${field.name}${optional}: ${typeStr};\n`;
      });

      typescript += `  Created Date: string;\n`;
      typescript += `  Modified Date: string;\n`;
      typescript += `}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: typescript,
        },
      ],
    };
  }

  /**
   * Generate React hooks for Bubble data type
   */
  private async generateHooks(dataType: string) {
    const hookCode = `
import { useState, useEffect } from 'react';
import { ${dataType} } from './types';
import * as BubbleAPI from './bubble-api';

export function use${dataType}s() {
  const [data, setData] = useState<${dataType}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    BubbleAPI.get${dataType}s()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const create = async (newData: Omit<${dataType}, '_id' | 'Created Date' | 'Modified Date'>) => {
    const created = await BubbleAPI.create${dataType}(newData);
    setData(prev => [...prev, created]);
    return created;
  };

  const update = async (id: string, updates: Partial<${dataType}>) => {
    const updated = await BubbleAPI.update${dataType}(id, updates);
    setData(prev => prev.map(item => item._id === id ? updated : item));
    return updated;
  };

  const remove = async (id: string) => {
    await BubbleAPI.delete${dataType}(id);
    setData(prev => prev.filter(item => item._id !== id));
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
  };
}
    `.trim();

    return {
      content: [
        {
          type: 'text',
          text: hookCode,
        },
      ],
    };
  }

  /**
   * Map Bubble types to TypeScript types
   */
  private mapBubbleTypeToTS(bubbleType: string, isList: boolean): string {
    let tsType: string;

    switch (bubbleType) {
      case 'text':
        tsType = 'string';
        break;
      case 'number':
        tsType = 'number';
        break;
      case 'date':
        tsType = 'string'; // ISO date string
        break;
      case 'yes/no':
        tsType = 'boolean';
        break;
      case 'image':
        tsType = 'string'; // URL
        break;
      default:
        tsType = 'any';
    }

    return isList ? `${tsType}[]` : tsType;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Bubble MCP server running on stdio');
  }
}

// Start server
const config: BubbleConfig = {
  appName: process.env.BUBBLE_APP_NAME || '',
  apiToken: process.env.BUBBLE_API_TOKEN || '',
  version: process.env.BUBBLE_VERSION || 'version-test',
};

const server = new BubbleMCPServer(config);
server.run().catch(console.error);
