/**
 * AI Engine WebSocket Server
 * Handles real-time communication between IDE and AI agents
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { AgentManager } from './agents';
import { GroqClient } from './groq-client';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI system
const groqClient = new GroqClient({
  apiKey: process.env.GROQ_API_KEY || '',
  model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
});

const agentManager = new AgentManager(groqClient);

// REST endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agents: ['orchestrator', 'designer', 'backend', 'developer'],
  });
});

app.post('/generate', async (req, res) => {
  try {
    const { fileKey, nodes, targetFramework, styleType } = req.body;

    // Use designer agent for code generation
    const response = await agentManager.executeAgent('designer', {
      prompt: `Generate ${targetFramework} code with ${styleType} styles from these Figma nodes: ${JSON.stringify(nodes)}`,
      context: { fileKey, nodes, targetFramework, styleType },
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  /**
   * Chat event - Single request/response
   */
  socket.on('chat', async (data, callback) => {
    try {
      const { agent, prompt, history, context } = data;

      console.log(`Chat request from ${socket.id} to ${agent} agent`);

      const response = await agentManager.executeAgent(agent, {
        prompt,
        context: {
          conversationHistory: history || [],
          ...context,
        },
      });

      if (callback) {
        callback({
          content: response.content,
          files: response.files,
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      if (callback) {
        callback({ error: error.message });
      }
    }
  });

  /**
   * Chat stream event - Streaming response
   */
  socket.on('chat-stream', async (data) => {
    try {
      const { streamId, agent, prompt, history, context } = data;

      console.log(`Stream request ${streamId} from ${socket.id} to ${agent} agent`);

      // Use streaming from Groq client
      const messages = [
        ...((history || []).map((h: any) => ({
          role: h.role,
          content: h.content,
        }))),
        { role: 'user', content: prompt },
      ];

      let fullContent = '';

      for await (const chunk of groqClient.chatStream(messages)) {
        fullContent += chunk;
        socket.emit('stream-chunk', { streamId, chunk });
      }

      // Extract files from complete response
      const files = agentManager.extractFilesFromResponse(fullContent);

      socket.emit('stream-complete', {
        streamId,
        content: fullContent,
        files,
      });
    } catch (error: any) {
      console.error('Stream error:', error);
      socket.emit('stream-error', { streamId: data.streamId, error: error.message });
    }
  });

  /**
   * Apply files to workspace
   */
  socket.on('apply-files', async (data, callback) => {
    try {
      const { files } = data;

      console.log(`Applying ${files.length} files for ${socket.id}`);

      // Get workspace path from context or use default
      const workspacePath = process.env.WORKSPACE_PATH || process.cwd();

      for (const file of files) {
        const filePath = path.join(workspacePath, file.path);
        const dir = path.dirname(filePath);

        // Create directories if they don't exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Write file
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      if (callback) {
        callback({ success: true, count: files.length });
      }
    } catch (error: any) {
      console.error('Apply files error:', error);
      if (callback) {
        callback({ error: error.message });
      }
    }
  });

  /**
   * Get available MCP servers
   */
  socket.on('get-mcp-servers', async (data, callback) => {
    try {
      const servers = [];

      // Check which MCP servers are configured
      if (process.env.BUBBLE_API_TOKEN) {
        servers.push({
          name: 'bubble',
          status: 'connected',
          app: process.env.BUBBLE_APP_NAME,
        });
      }

      if (process.env.SUPABASE_URL) {
        servers.push({
          name: 'supabase',
          status: 'connected',
          url: process.env.SUPABASE_URL,
        });
      }

      if (process.env.FIREBASE_PROJECT_ID) {
        servers.push({
          name: 'firebase',
          status: 'connected',
          project: process.env.FIREBASE_PROJECT_ID,
        });
      }

      if (callback) {
        callback({ servers });
      }
    } catch (error: any) {
      console.error('Get MCP servers error:', error);
      if (callback) {
        callback({ error: error.message });
      }
    }
  });

  /**
   * Generate code from Figma nodes
   */
  socket.on('generate-from-figma', async (data, callback) => {
    try {
      const { fileKey, nodeIds, options } = data;

      console.log(`Generating code from Figma file ${fileKey}`);

      const response = await agentManager.executeAgent('designer', {
        prompt: `Generate React Native code from Figma file ${fileKey}, nodes: ${nodeIds.join(', ')}`,
        context: {
          fileKey,
          nodeIds,
          styleType: options?.styleType || 'stylesheet',
          typescript: options?.typescript !== false,
        },
      });

      if (callback) {
        callback({
          content: response.content,
          files: response.files,
        });
      }
    } catch (error: any) {
      console.error('Generate from Figma error:', error);
      if (callback) {
        callback({ error: error.message });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.AI_ENGINE_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🤖 AI Engine running on port ${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   REST API: http://localhost:${PORT}`);
  console.log(`   Model: ${process.env.GROQ_MODEL || 'llama-3.1-70b-versatile'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('   GET  /health');
  console.log('   POST /generate');
  console.log('');
  console.log('WebSocket events:');
  console.log('   chat, chat-stream, apply-files');
  console.log('   get-mcp-servers, generate-from-figma');
});

export { app, httpServer, io };
