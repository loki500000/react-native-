/**
 * Settings Frontend Module
 * Registers the extension with Theia
 */

import { ContainerModule } from 'inversify';
import { SettingsWidget } from './settings-widget';
import { SettingsService } from '../common/settings-service';
import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';
import { bindViewContribution } from '@theia/core/lib/browser/view-contribution';
import { SettingsContribution } from './settings-contribution';

export default new ContainerModule(bind => {
  // Bind service
  bind(SettingsService).toSelf().inSingletonScope();

  // Bind widget
  bind(SettingsWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(ctx => ({
    id: SettingsWidget.ID,
    createWidget: () => ctx.container.get<SettingsWidget>(SettingsWidget),
  })).inSingletonScope();

  // Bind view contribution
  bindViewContribution(bind, SettingsContribution);
});
