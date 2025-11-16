/**
 * Preview Panel Frontend Module
 * Registers the extension with Theia
 */

import { ContainerModule } from 'inversify';
import { PreviewPanelWidget } from './preview-panel-widget';
import { PreviewService } from '../common/preview-service';
import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';
import { bindViewContribution } from '@theia/core/lib/browser/view-contribution';
import { PreviewPanelContribution } from './preview-panel-contribution';

export default new ContainerModule(bind => {
  // Bind service
  bind(PreviewService).toSelf().inSingletonScope();

  // Bind widget
  bind(PreviewPanelWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(ctx => ({
    id: PreviewPanelWidget.ID,
    createWidget: () => ctx.container.get<PreviewPanelWidget>(PreviewPanelWidget),
  })).inSingletonScope();

  // Bind view contribution
  bindViewContribution(bind, PreviewPanelContribution);
});
