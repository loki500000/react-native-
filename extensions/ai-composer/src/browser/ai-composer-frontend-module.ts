/**
 * AI Composer Frontend Module
 * Registers the extension with Theia
 */

import { ContainerModule } from 'inversify';
import { AIComposerWidget } from './ai-composer-widget';
import { AIService } from '../common/ai-service';
import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';
import { bindViewContribution } from '@theia/core/lib/browser/view-contribution';
import { AIComposerContribution } from './ai-composer-contribution';

export default new ContainerModule(bind => {
  // Bind service
  bind(AIService).toSelf().inSingletonScope();

  // Bind widget
  bind(AIComposerWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(ctx => ({
    id: AIComposerWidget.ID,
    createWidget: () => ctx.container.get<AIComposerWidget>(AIComposerWidget),
  })).inSingletonScope();

  // Bind view contribution
  bindViewContribution(bind, AIComposerContribution);
});
