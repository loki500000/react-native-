/**
 * Settings Contribution
 * Registers commands and menu items
 */

import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { SettingsWidget } from './settings-widget';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';

export const SettingsCommand: Command = {
  id: 'settings:open',
  label: 'Open Settings',
  iconClass: 'fa fa-cog',
};

@injectable()
export class SettingsContribution extends AbstractViewContribution<SettingsWidget> {
  constructor() {
    super({
      widgetId: SettingsWidget.ID,
      widgetName: SettingsWidget.LABEL,
      defaultWidgetOptions: {
        area: 'main',
      },
      toggleCommandId: SettingsCommand.id,
    });
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(SettingsCommand, {
      execute: () => super.openView({ activate: true, reveal: true }),
    });
  }

  registerMenus(menus: MenuModelRegistry): void {
    // Add to File menu
    menus.registerMenuAction(CommonMenus.FILE_SETTINGS_SUBMENU_OPEN, {
      commandId: SettingsCommand.id,
      label: 'Figma Studio AI Settings',
      order: '0',
    });

    // Add to View menu
    menus.registerMenuAction(CommonMenus.VIEW_VIEWS, {
      commandId: SettingsCommand.id,
      label: SettingsWidget.LABEL,
    });
  }
}
