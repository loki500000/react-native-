/**
 * Preview Panel Contribution
 * Registers commands and menu items
 */

import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { PreviewPanelWidget } from './preview-panel-widget';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';

export const PreviewPanelCommand: Command = {
  id: 'preview-panel:toggle',
  label: 'Toggle Preview Panel',
};

@injectable()
export class PreviewPanelContribution extends AbstractViewContribution<PreviewPanelWidget> {
  constructor() {
    super({
      widgetId: PreviewPanelWidget.ID,
      widgetName: PreviewPanelWidget.LABEL,
      defaultWidgetOptions: {
        area: 'right',
        rank: 300,
      },
      toggleCommandId: PreviewPanelCommand.id,
    });
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(PreviewPanelCommand, {
      execute: () => super.openView({ activate: true, reveal: true }),
    });
  }

  registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(CommonMenus.VIEW_VIEWS, {
      commandId: PreviewPanelCommand.id,
      label: PreviewPanelWidget.LABEL,
    });
  }
}
