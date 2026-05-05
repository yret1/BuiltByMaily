import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideEmailBuilder } from '@builtbymaily/email-builder';

/**
 * Standalone iframe build. The host page passes configuration via postMessage:
 * { type: 'EMB_INIT', payload: { apiKey, workspaceId, templateId?, apiUrl } }
 */
bootstrapApplication(AppComponent, {
  providers: [
    // apiUrl is set dynamically via postMessage after bootstrap
    provideEmailBuilder({ apiUrl: '' }),
  ],
}).catch((err) => console.error(err));
