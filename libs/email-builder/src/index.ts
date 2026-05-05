// Public API surface of @builtbymaily/email-builder

export { EmailBuilderComponent } from './lib/email-builder.component';
export { EmailBuilderModule, provideEmailBuilder } from './lib/email-builder.module';
export { TemplateService } from './lib/services/template.service';
export { HistoryService } from './lib/services/history.service';
export { ApiService } from './lib/services/api.service';
export { EMAIL_BUILDER_CONFIG } from './lib/email-builder.token';

// Schema types
export type {
  AnyBlock,
  BlockType,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  HtmlBlock,
  ColumnDef,
  Spacing,
  EmailTemplate,
} from './lib/schema/block.types';

export {
  DEFAULT_SPACING,
  createBlankTemplate,
} from './lib/schema/block.types';

export { createDefaultBlock } from './lib/schema/block.defaults';
export { createDefaultTemplate } from './lib/schema/template.presets';
export { HtmlRendererService } from './lib/services/html-renderer.service';

export type {
  BuilderConfig,
  BuilderTheme,
  BuilderFeatures,
  TemplateSavedEvent,
  TemplateExportedEvent,
  EmailBuilderModuleConfig,
} from './lib/schema/builder-config.types';
