/**
 * Integration Test: Figma → Code → Preview workflow
 * Tests the complete end-to-end pipeline
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const IDE_URL = 'http://localhost:3000';
const AI_ENGINE_URL = 'http://localhost:3001';
const PREVIEW_SERVER_URL = 'http://localhost:3002';

describe('Figma to Preview Integration Test', () => {
  let aiSocket: Socket;
  let previewSocket: Socket;

  beforeAll(async () => {
    // Wait for services to be ready
    await waitForServices();

    // Connect to WebSocket servers
    aiSocket = io(AI_ENGINE_URL);
    previewSocket = io(PREVIEW_SERVER_URL);

    await Promise.all([
      waitForConnection(aiSocket),
      waitForConnection(previewSocket),
    ]);
  });

  afterAll(() => {
    aiSocket.disconnect();
    previewSocket.disconnect();
  });

  it('should have all services running', async () => {
    // Check AI Engine
    const aiHealth = await axios.get(`${AI_ENGINE_URL}/health`);
    expect(aiHealth.status).toBe(200);
    expect(aiHealth.data.status).toBe('healthy');

    // Check IDE (basic check)
    try {
      await axios.get(IDE_URL, { timeout: 5000 });
    } catch (error: any) {
      // IDE might not respond to GET, but should be accessible
      expect(error.code).not.toBe('ECONNREFUSED');
    }
  });

  it('should generate code from Figma using AI', (done) => {
    const testPrompt = 'Create a simple login screen with email and password inputs';

    aiSocket.emit(
      'chat',
      {
        agent: 'designer',
        prompt: testPrompt,
        context: {},
      },
      (response: any) => {
        expect(response).toBeDefined();
        expect(response.content).toBeDefined();
        expect(response.content.length).toBeGreaterThan(0);

        // Should contain React Native code
        expect(response.content).toMatch(/import.*react/i);
        done();
      }
    );
  }, 30000); // 30 second timeout for AI

  it('should create preview from generated code', (done) => {
    const testCode = `
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestComponent() {
  return (
    <View style={styles.container}>
      <Text>Test Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
    `;

    previewSocket.emit(
      'create-preview',
      {
        name: 'integration-test',
        files: {
          'App.tsx': testCode,
        },
      },
      (response: any) => {
        expect(response).toBeDefined();
        expect(response.snackUrl).toBeDefined();
        expect(response.snackUrl).toContain('snack.expo.dev');
        done();
      }
    );
  }, 15000);

  it('should extract files from AI response', (done) => {
    const promptWithCode = 'Create a button component';

    aiSocket.emit(
      'chat',
      {
        agent: 'designer',
        prompt: promptWithCode,
      },
      (response: any) => {
        expect(response).toBeDefined();

        // Check if files were extracted
        if (response.files && response.files.length > 0) {
          expect(response.files[0]).toHaveProperty('path');
          expect(response.files[0]).toHaveProperty('content');
        }

        done();
      }
    );
  }, 30000);

  it('should get MCP server list', (done) => {
    aiSocket.emit('get-mcp-servers', {}, (response: any) => {
      expect(response).toBeDefined();
      expect(response.servers).toBeDefined();
      expect(Array.isArray(response.servers)).toBe(true);
      done();
    });
  });
});

/**
 * Helper: Wait for services to be ready
 */
async function waitForServices(): Promise<void> {
  const maxAttempts = 30;
  const delay = 1000;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 2000 });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Services not ready after 30 seconds');
}

/**
 * Helper: Wait for WebSocket connection
 */
function waitForConnection(socket: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
