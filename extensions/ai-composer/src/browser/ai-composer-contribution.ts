/**
 * AI Composer Contribution
 * Registers commands and menu items
 */

import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { AIComposerWidget } from './ai-composer-widget';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';

export const AIComposerCommand: Command = {
  id: 'ai-composer:toggle',
  label: 'Toggle AI Composer',
};

@injectable()
export class AIComposerContribution extends AbstractViewContribution<AIComposerWidget> {
  constructor() {
    super({
      widgetId: AIComposerWidget.ID,
      widgetName: AIComposerWidget.LABEL,
      defaultWidgetOptions: {
        area: 'right',
        rank: 100,
      },
      toggleCommandId: AIComposerCommand.id,
    });
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(AIComposerCommand, {
      execute: () => super.openView({ activate: true, reveal: true }),
    });
  }

  registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(CommonMenus.VIEW_VIEWS, {
      commandId: AIComposerCommand.id,
      label: AIComposerWidget.LABEL,
    });
  }
}
