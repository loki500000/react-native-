/**
 * AI Composer Widget
 * Chat interface for AI-powered development
 */

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core/lib/common/message-service';
import { AIService } from '../common/ai-service';

export const AI_COMPOSER_ID = 'ai-composer';
export const AI_COMPOSER_LABEL = 'AI Composer';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: GeneratedFile[];
}

interface GeneratedFile {
  path: string;
  content: string;
}

@injectable()
export class AIComposerWidget extends ReactWidget {
  static readonly ID = AI_COMPOSER_ID;
  static readonly LABEL = AI_COMPOSER_LABEL;

  @inject(MessageService)
  protected readonly messageService!: MessageService;

  @inject(AIService)
  protected readonly aiService!: AIService;

  protected messages: Message[] = [];
  protected inputValue = '';
  protected isGenerating = false;
  protected selectedAgent: 'orchestrator' | 'designer' | 'backend' | 'developer' = 'orchestrator';

  @postConstruct()
  protected init(): void {
    this.id = AI_COMPOSER_ID;
    this.title.label = AI_COMPOSER_LABEL;
    this.title.caption = AI_COMPOSER_LABEL;
    this.title.closable = true;
    this.title.iconClass = 'fa fa-robot';

    // Add welcome message
    this.messages.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hello! I'm your AI assistant powered by Groq AI. I can help you:

• Convert Figma designs to React Native code
• Build features and add functionality
• Connect to backends (Bubble, Supabase, Firebase)
• Debug and optimize your code

What would you like to build today?`,
      timestamp: new Date(),
    });

    this.update();
  }

  protected async sendMessage(): Promise<void> {
    if (!this.inputValue.trim() || this.isGenerating) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: this.inputValue,
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    const prompt = this.inputValue;
    this.inputValue = '';
    this.isGenerating = true;
    this.update();

    try {
      // Send to AI service
      const response = await this.aiService.chat(this.selectedAgent, prompt, {
        conversationHistory: this.messages.slice(0, -1),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        files: response.files,
      };

      this.messages.push(assistantMessage);
      this.isGenerating = false;
      this.update();

      // Scroll to bottom
      this.scrollToBottom();
    } catch (error: any) {
      this.messageService.error(`AI error: ${error.message}`);
      this.isGenerating = false;
      this.update();
    }
  }

  protected async applyGeneratedFiles(files: GeneratedFile[]): Promise<void> {
    try {
      await this.aiService.applyFiles(files);
      this.messageService.info(`Applied ${files.length} files to workspace`);
    } catch (error: any) {
      this.messageService.error(`Failed to apply files: ${error.message}`);
    }
  }

  protected scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  protected renderMessage(message: Message): React.ReactNode {
    const isUser = message.role === 'user';

    return (
      <div key={message.id} className={`message ${message.role}`}>
        <div className="message-header">
          <span className="message-role">
            {isUser ? '👤 You' : '🤖 AI Assistant'}
          </span>
          <span className="message-time">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="message-content">
          {message.content}
        </div>
        {message.files && message.files.length > 0 && (
          <div className="generated-files">
            <div className="files-header">
              <span>📁 Generated {message.files.length} files:</span>
              <button
                className="apply-button"
                onClick={() => this.applyGeneratedFiles(message.files!)}
              >
                ✨ Apply to Workspace
              </button>
            </div>
            <div className="files-list">
              {message.files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-icon">📄</span>
                  <span className="file-path">{file.path}</span>
                  <span className="file-size">
                    {file.content.length} chars
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  protected render(): React.ReactNode {
    return (
      <div className="ai-composer">
        {/* Header */}
        <div className="composer-header">
          <h3>AI Composer</h3>
          <div className="agent-selector">
            <label>Agent:</label>
            <select
              value={this.selectedAgent}
              onChange={(e) => {
                this.selectedAgent = e.target.value as any;
                this.update();
              }}
            >
              <option value="orchestrator">🎯 Orchestrator (Smart Routing)</option>
              <option value="designer">🎨 Designer (Figma → React Native)</option>
              <option value="backend">🗄️ Backend (Database & APIs)</option>
              <option value="developer">⚙️ Developer (Features & Logic)</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {this.messages.map(msg => this.renderMessage(msg))}
          {this.isGenerating && (
            <div className="message assistant generating">
              <div className="message-header">
                <span className="message-role">🤖 AI Assistant</span>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="generating-text">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="input-container">
          <textarea
            className="message-input"
            placeholder="Ask me anything... (e.g., 'Build a login screen with email and password')"
            value={this.inputValue}
            onChange={(e) => {
              this.inputValue = e.target.value;
              this.update();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
              }
            }}
            disabled={this.isGenerating}
            rows={3}
          />
          <button
            className="send-button"
            onClick={() => this.sendMessage()}
            disabled={!this.inputValue.trim() || this.isGenerating}
          >
            {this.isGenerating ? '⏳ Generating...' : '🚀 Send'}
          </button>
        </div>

        {/* Tips */}
        <div className="tips-container">
          <div className="tip">
            💡 Tip: Use Shift+Enter for new line, Enter to send
          </div>
        </div>
      </div>
    );
  }
}
