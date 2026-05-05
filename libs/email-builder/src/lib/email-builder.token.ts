import { InjectionToken } from '@angular/core';
import type { EmailBuilderModuleConfig } from './schema/builder-config.types';

export const EMAIL_BUILDER_CONFIG = new InjectionToken<EmailBuilderModuleConfig>(
  'EMAIL_BUILDER_CONFIG'
);
