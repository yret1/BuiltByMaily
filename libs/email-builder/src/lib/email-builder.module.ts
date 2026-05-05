import { NgModule, ModuleWithProviders } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { EMAIL_BUILDER_CONFIG } from './email-builder.token';
import type { EmailBuilderModuleConfig } from './schema/builder-config.types';
import { EmailBuilderComponent } from './email-builder.component';

/** Entry point for Angular-module-based apps. Standalone-first apps should use provideEmailBuilder(). */
@NgModule({
  imports: [EmailBuilderComponent],
  exports: [EmailBuilderComponent],
})
export class EmailBuilderModule {
  static forRoot(config: EmailBuilderModuleConfig): ModuleWithProviders<EmailBuilderModule> {
    return {
      ngModule: EmailBuilderModule,
      providers: [
        provideHttpClient(),
        { provide: EMAIL_BUILDER_CONFIG, useValue: config },
      ],
    };
  }
}

/** Standalone / functional provider for Angular 17+ apps. */
export function provideEmailBuilder(config: EmailBuilderModuleConfig) {
  return [
    provideHttpClient(),
    { provide: EMAIL_BUILDER_CONFIG, useValue: config },
  ];
}
