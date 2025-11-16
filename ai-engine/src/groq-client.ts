/**
 * Groq AI Client
 * Fast LLM API integration
 */

import Groq from 'groq-sdk';

export interface GroqConfig {
  apiKey: string;
  model?: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GroqClient {
  private client: Groq;
  private model: string;

  constructor(config: GroqConfig) {
    this.client = new Groq({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'llama-3.1-70b-versatile';
  }

  /**
   * Send a chat completion request
   */
  async chat(messages: Message[], options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 4096,
      stream: options?.stream || false,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Stream chat completion
   */
  async *chatStream(messages: Message[], options?: {
    temperature?: number;
    maxTokens?: number;
  }): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Change model
   */
  setModel(model: 'llama-3.1-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768') {
    this.model = model;
  }
}
