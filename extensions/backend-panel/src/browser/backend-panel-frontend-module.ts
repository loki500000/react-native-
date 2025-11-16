/**
 * Backend Panel Frontend Module
 * Registers the extension with Theia
 */

import { ContainerModule } from 'inversify';
import { BackendPanelWidget } from './backend-panel-widget';
import { MCPService } from '../common/mcp-service';
import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';
import { bindViewContribution } from '@theia/core/lib/browser/view-contribution';
import { BackendPanelContribution } from './backend-panel-contribution';

export default new ContainerModule(bind => {
  // Bind service
  bind(MCPService).toSelf().inSingletonScope();

  // Bind widget
  bind(BackendPanelWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(ctx => ({
    id: BackendPanelWidget.ID,
    createWidget: () => ctx.container.get<BackendPanelWidget>(BackendPanelWidget),
  })).inSingletonScope();

  // Bind view contribution
  bindViewContribution(bind, BackendPanelContribution);
});
