/**
 * Figma Explorer Frontend Module
 * Registers the extension with Theia
 */

import { ContainerModule } from 'inversify';
import { FigmaExplorerWidget } from './figma-explorer-widget';
import { FigmaService } from '../common/figma-service';
import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';
import { bindViewContribution } from '@theia/core/lib/browser/view-contribution';
import { FigmaExplorerContribution } from './figma-explorer-contribution';

export default new ContainerModule(bind => {
  // Bind service
  bind(FigmaService).toSelf().inSingletonScope();

  // Bind widget
  bind(FigmaExplorerWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(ctx => ({
    id: FigmaExplorerWidget.ID,
    createWidget: () => ctx.container.get<FigmaExplorerWidget>(FigmaExplorerWidget),
  })).inSingletonScope();

  // Bind view contribution
  bindViewContribution(bind, FigmaExplorerContribution);
});
