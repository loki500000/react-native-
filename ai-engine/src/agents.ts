/**
 * AI Agent System
 * Multi-agent architecture for different tasks
 */

import { GroqClient, Message } from './groq-client';

export interface AgentContext {
  figmaDesign?: any;
  codeFiles?: Record<string, string>;
  databaseSchema?: any;
  apiEndpoints?: any[];
}

export interface AgentResponse {
  content: string;
  actions?: AgentAction[];
  files?: { path: string; content: string }[];
}

export interface AgentAction {
  type: 'create_file' | 'update_file' | 'delete_file' | 'run_command';
  payload: any;
}

/**
 * Base Agent
 */
export abstract class BaseAgent {
  protected groq: GroqClient;
  protected systemPrompt: string;

  constructor(groq: GroqClient, systemPrompt: string) {
    this.groq = groq;
    this.systemPrompt = systemPrompt;
  }

  protected async chat(userPrompt: string, context?: AgentContext): Promise<string> {
    const messages: Message[] = [
      { role: 'system', content: this.systemPrompt },
    ];

    // Add context
    if (context) {
      messages.push({
        role: 'system',
        content: `Context:\n${JSON.stringify(context, null, 2)}`,
      });
    }

    messages.push({ role: 'user', content: userPrompt });

    return await this.groq.chat(messages);
  }

  abstract execute(prompt: string, context?: AgentContext): Promise<AgentResponse>;
}

/**
 * Designer Agent - Figma → React Native
 */
export class DesignerAgent extends BaseAgent {
  constructor(groq: GroqClient) {
    super(
      groq,
      `You are an expert React Native developer specializing in converting Figma designs to production-ready code.

Your responsibilities:
- Analyze Figma designs and extract component structure
- Convert Auto Layout to Flexbox
- Generate clean, type-safe React Native components
- Follow React Native best practices
- Use appropriate components (TouchableOpacity for buttons, Image for icons, etc.)
- Generate responsive layouts
- Extract and use design tokens

Always generate production-ready, well-structured code.`
    );
  }

  async execute(prompt: string, context?: AgentContext): Promise<AgentResponse> {
    const response = await this.chat(prompt, context);

    return {
      content: response,
      files: this.extractFilesFromResponse(response),
    };
  }

  private extractFilesFromResponse(response: string): { path: string; content: string }[] {
    // Extract code blocks from response
    const files: { path: string; content: string }[] = [];
    const codeBlockRegex = /```(?:typescript|tsx|javascript|jsx)?\n(?:\/\/ (.*\.tsx?)\n)?([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const fileName = match[1] || 'Component.tsx';
      const content = match[2];
      files.push({ path: fileName, content });
    }

    return files;
  }
}

/**
 * Backend Agent - Database & API integration
 */
export class BackendAgent extends BaseAgent {
  constructor(groq: GroqClient) {
    super(
      groq,
      `You are an expert backend integration specialist for React Native apps.

Your responsibilities:
- Understand database schemas from MCP servers
- Generate TypeScript types from schemas
- Create React hooks for CRUD operations
- Implement API clients
- Handle authentication flows
- Add error handling and loading states
- Implement real-time subscriptions when available

Generate production-ready, type-safe integration code.`
    );
  }

  async execute(prompt: string, context?: AgentContext): Promise<AgentResponse> {
    const response = await this.chat(prompt, context);

    return {
      content: response,
      files: this.extractFilesFromResponse(response),
    };
  }

  private extractFilesFromResponse(response: string): { path: string; content: string }[] {
    const files: { path: string; content: string }[] = [];
    const codeBlockRegex = /```(?:typescript|tsx)?\n(?:\/\/ (.*\.ts)\n)?([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const fileName = match[1] || 'api.ts';
      const content = match[2];
      files.push({ path: fileName, content });
    }

    return files;
  }
}

/**
 * Developer Agent - Feature implementation
 */
export class DeveloperAgent extends BaseAgent {
  constructor(groq: GroqClient) {
    super(
      groq,
      `You are an expert React Native developer.

Your responsibilities:
- Implement new features based on requirements
- Refactor existing code
- Add animations and interactions
- Implement complex business logic
- Optimize performance
- Fix bugs
- Write clean, maintainable code

Always follow React Native and TypeScript best practices.`
    );
  }

  async execute(prompt: string, context?: AgentContext): Promise<AgentResponse> {
    const response = await this.chat(prompt, context);

    return {
      content: response,
      files: this.extractFilesFromResponse(response),
    };
  }

  private extractFilesFromResponse(response: string): { path: string; content: string }[] {
    const files: { path: string; content: string }[] = [];
    const codeBlockRegex = /```(?:typescript|tsx|javascript|jsx)?\n(?:\/\/ (.*)\n)?([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const fileName = match[1] || 'code.tsx';
      const content = match[2];
      files.push({ path: fileName, content });
    }

    return files;
  }
}

/**
 * Orchestrator Agent - Coordinates all agents
 */
export class OrchestratorAgent extends BaseAgent {
  private designerAgent: DesignerAgent;
  private backendAgent: BackendAgent;
  private developerAgent: DeveloperAgent;

  constructor(groq: GroqClient) {
    super(
      groq,
      `You are an AI orchestrator that coordinates multiple specialized agents.

Your responsibilities:
- Analyze user requests and determine which agents are needed
- Break down complex tasks into subtasks
- Coordinate between Designer, Backend, and Developer agents
- Integrate outputs from different agents
- Ensure coherent final result

Available agents:
- Designer: Figma → React Native UI
- Backend: Database & API integration
- Developer: Feature implementation & logic

Respond with which agents to use and what tasks to give them.`
    );

    this.designerAgent = new DesignerAgent(groq);
    this.backendAgent = new BackendAgent(groq);
    this.developerAgent = new DeveloperAgent(groq);
  }

  async execute(prompt: string, context?: AgentContext): Promise<AgentResponse> {
    // Analyze what agents are needed
    const plan = await this.chat(
      `User request: "${prompt}"\n\nAnalyze this request and determine:\n1. Which agents are needed (Designer, Backend, Developer)?\n2. What specific tasks should each agent do?\n3. In what order should they work?\n\nRespond in JSON format.`,
      context
    );

    // For now, return the plan
    // In full implementation, this would execute the agents
    return {
      content: plan,
    };
  }
}

/**
 * Agent Manager - Main interface
 */
export class AgentManager {
  private groq: GroqClient;
  private orchestrator: OrchestratorAgent;
  private designer: DesignerAgent;
  private backend: BackendAgent;
  private developer: DeveloperAgent;

  constructor(apiKey: string) {
    this.groq = new GroqClient({ apiKey });
    this.orchestrator = new OrchestratorAgent(this.groq);
    this.designer = new DesignerAgent(this.groq);
    this.backend = new BackendAgent(this.groq);
    this.developer = new DeveloperAgent(this.groq);
  }

  /**
   * Execute a user request
   */
  async execute(prompt: string, context?: AgentContext): Promise<AgentResponse> {
    // Use orchestrator to coordinate
    return await this.orchestrator.execute(prompt, context);
  }

  /**
   * Get specific agent
   */
  getAgent(type: 'designer' | 'backend' | 'developer' | 'orchestrator') {
    switch (type) {
      case 'designer':
        return this.designer;
      case 'backend':
        return this.backend;
      case 'developer':
        return this.developer;
      case 'orchestrator':
        return this.orchestrator;
    }
  }

  /**
   * Change AI model
   */
  setModel(model: 'llama-3.1-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768') {
    this.groq.setModel(model);
  }
}
