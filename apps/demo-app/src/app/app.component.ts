import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailBuilderComponent } from '@builtbymaily/email-builder';
import type { TemplateSavedEvent, TemplateExportedEvent } from '@builtbymaily/email-builder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmailBuilderComponent],
  template: `
    <header class="demo-header">
      <div class="demo-header__brand">BuiltByMaily — Email Builder Demo</div>
      <div class="demo-header__meta">
        @if (lastSaved()) {
          <span class="demo-header__saved">Saved at {{ lastSaved() }}</span>
        }
      </div>
    </header>

    <div class="demo-builder">
      <emb-email-builder
        apiKey="demo_key"
        workspaceId="demo_workspace"
        [config]="builderConfig"
        (templateSaved)="onSaved($event)"
        (templateExported)="onExported($event)"
      />
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100vh; }
    .demo-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      height: 52px;
      background: #1a1a2e;
      color: white;
      flex-shrink: 0;
    }
    .demo-header__brand { font-weight: 700; font-size: 16px; letter-spacing: -0.3px; }
    .demo-header__saved { font-size: 13px; color: #90ee90; }
    .demo-builder { flex: 1; overflow: hidden; }
  `],
})
export class AppComponent {
  protected readonly lastSaved = signal<string | null>(null);
  protected readonly builderConfig = {
    features: { htmlBlock: true, assetLibrary: false, versionHistory: false },
  };

  onSaved(event: TemplateSavedEvent): void {
    this.lastSaved.set(new Date().toLocaleTimeString());
    console.log('Template saved:', event.templateId);
  }

  onExported(event: TemplateExportedEvent): void {
    console.log('Exported HTML length:', event.html.length);
  }
}
