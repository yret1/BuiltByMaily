import type { BlockType, EmailTemplate } from './block.types';

export interface BuilderTheme {
  primaryColor?: string;
  fontFamily?: string;
  borderRadius?: number;
}

export interface BuilderFeatures {
  /** Show the raw HTML block type (default: true) */
  htmlBlock?: boolean;
  /** Show the asset library panel (default: true) */
  assetLibrary?: boolean;
  /** Enable version history (Pro plan only, default: false) */
  versionHistory?: boolean;
}

export interface BuilderConfig {
  /** Restrict which block types are available. Omit to allow all. */
  allowedBlocks?: BlockType[];
  /** Lock brand colours — palette is shown but colour picker is disabled. */
  brandColors?: string[];
  theme?: BuilderTheme;
  /** UI locale (default: 'en') */
  locale?: string;
  features?: BuilderFeatures;
}

export interface TemplateSavedEvent {
  templateId: string;
  name: string;
  schema: EmailTemplate;
}

export interface TemplateExportedEvent {
  templateId: string;
  html: string;
  plainText: string;
}

export interface EmailBuilderModuleConfig {
  apiUrl: string;
}
