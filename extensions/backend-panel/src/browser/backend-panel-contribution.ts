/**
 * Backend Panel Contribution
 * Registers commands and menu items
 */

import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { BackendPanelWidget } from './backend-panel-widget';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';

export const BackendPanelCommand: Command = {
  id: 'backend-panel:toggle',
  label: 'Toggle Backend Panel',
};

@injectable()
export class BackendPanelContribution extends AbstractViewContribution<BackendPanelWidget> {
  constructor() {
    super({
      widgetId: BackendPanelWidget.ID,
      widgetName: BackendPanelWidget.LABEL,
      defaultWidgetOptions: {
        area: 'right',
        rank: 200,
      },
      toggleCommandId: BackendPanelCommand.id,
    });
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(BackendPanelCommand, {
      execute: () => super.openView({ activate: true, reveal: true }),
    });
  }

  registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(CommonMenus.VIEW_VIEWS, {
      commandId: BackendPanelCommand.id,
      label: BackendPanelWidget.LABEL,
    });
  }
}
