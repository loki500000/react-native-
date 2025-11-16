/**
 * Figma Explorer Contribution
 * Registers commands and menu items
 */

import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { FigmaExplorerWidget } from './figma-explorer-widget';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';

export const FigmaExplorerCommand: Command = {
  id: 'figma-explorer:toggle',
  label: 'Toggle Figma Explorer',
};

@injectable()
export class FigmaExplorerContribution extends AbstractViewContribution<FigmaExplorerWidget> {
  constructor() {
    super({
      widgetId: FigmaExplorerWidget.ID,
      widgetName: FigmaExplorerWidget.LABEL,
      defaultWidgetOptions: {
        area: 'left',
        rank: 100,
      },
      toggleCommandId: FigmaExplorerCommand.id,
    });
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(FigmaExplorerCommand, {
      execute: () => super.openView({ activate: true, reveal: true }),
    });
  }

  registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(CommonMenus.VIEW_VIEWS, {
      commandId: FigmaExplorerCommand.id,
      label: FigmaExplorerWidget.LABEL,
    });
  }
}
