import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EmailBuilderComponent,
  HtmlRendererService,
  TemplateService,
} from '@builtbymaily/email-builder';
import type { TemplateSavedEvent, TemplateExportedEvent } from '@builtbymaily/email-builder';

type Tab = 'build' | 'preview';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmailBuilderComponent],
  template: `
    <header class="demo-header">
      <div class="demo-header__brand">BuiltByMaily</div>

      <nav class="demo-tabs">
        <button
          class="demo-tabs__btn"
          [class.demo-tabs__btn--active]="activeTab() === 'build'"
          (click)="setTab('build')"
        >Build</button>
        <button
          class="demo-tabs__btn"
          [class.demo-tabs__btn--active]="activeTab() === 'preview'"
          (click)="openPreview()"
        >Preview</button>
      </nav>

      <div class="demo-header__meta">
        @if (lastSaved()) {
          <span class="demo-header__saved">Saved {{ lastSaved() }}</span>
        }
      </div>
    </header>

    <!-- Builder -->
    <div class="demo-pane" [style.display]="activeTab() === 'build' ? 'block' : 'none'">
      <emb-email-builder
        apiKey="demo_key"
        workspaceId="demo_workspace"
        [config]="builderConfig"
        (templateSaved)="onSaved($event)"
        (templateExported)="onExported($event)"
      />
    </div>

    <!-- Preview -->
    @if (activeTab() === 'preview') {
      <div class="demo-preview">
        <div class="demo-preview__toolbar">
          <div class="demo-preview__label">
            Rendered preview — table-based email HTML (no API required)
          </div>
          <div class="demo-preview__actions">
            <select
              class="demo-preview__select"
              [value]="previewWidth()"
              (change)="setWidth($event)"
              title="Preview width"
            >
              <option value="600">Desktop (600px)</option>
              <option value="375">Mobile (375px)</option>
              <option value="100%">Full width</option>
            </select>
            <button class="demo-preview__btn" (click)="copyHtml()" title="Copy HTML to clipboard">
              {{ copied() ? '✓ Copied!' : 'Copy HTML' }}
            </button>
            <button class="demo-preview__btn" (click)="downloadHtml()" title="Download as .html file">
              Download .html
            </button>
          </div>
        </div>

        <div class="demo-preview__frame-wrap">
          <iframe
            class="demo-preview__frame"
            [srcdoc]="previewHtml()"
            [style.width]="previewWidth()"
            sandbox="allow-same-origin"
            title="Email preview"
          ></iframe>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

    /* Header */
    .demo-header {
      display: flex;
      align-items: center;
      padding: 0 20px;
      height: 52px;
      background: #1a1a2e;
      color: white;
      gap: 20px;
      flex-shrink: 0;
    }
    .demo-header__brand { font-weight: 700; font-size: 16px; letter-spacing: -0.3px; }
    .demo-header__meta { margin-left: auto; font-size: 13px; }
    .demo-header__saved { color: #90ee90; }

    /* Tabs */
    .demo-tabs { display: flex; gap: 2px; }
    .demo-tabs__btn {
      padding: 6px 18px;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.7);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.15s, color 0.15s;
    }
    .demo-tabs__btn:hover { background: rgba(255,255,255,0.2); color: white; }
    .demo-tabs__btn--active { background: white; color: #1a1a2e; font-weight: 600; }

    /* Builder pane */
    .demo-pane { flex: 1; overflow: hidden; }

    /* Preview pane */
    .demo-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #e8e8e8;
    }
    .demo-preview__toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background: white;
      border-bottom: 1px solid #dee2e6;
      flex-shrink: 0;
      gap: 12px;
      flex-wrap: wrap;
    }
    .demo-preview__label { font-size: 13px; color: #6c757d; }
    .demo-preview__actions { display: flex; align-items: center; gap: 8px; }
    .demo-preview__select {
      padding: 6px 10px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 13px;
      background: white;
      cursor: pointer;
    }
    .demo-preview__btn {
      padding: 6px 14px;
      background: #1a1a2e;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }
    .demo-preview__btn:hover { filter: brightness(1.3); }
    .demo-preview__frame-wrap {
      flex: 1;
      overflow: auto;
      display: flex;
      justify-content: center;
      padding: 24px;
    }
    .demo-preview__frame {
      border: none;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      height: 100%;
      min-height: 600px;
      display: block;
      transition: width 0.2s;
    }
  `],
})
export class AppComponent {
  protected readonly activeTab = signal<Tab>('build');
  protected readonly lastSaved = signal<string | null>(null);
  protected readonly previewHtml = signal('');
  protected readonly previewWidth = signal('600px');
  protected readonly copied = signal(false);

  protected readonly builderConfig = {
    features: { htmlBlock: true, assetLibrary: false, versionHistory: false },
  };

  private readonly renderer = inject(HtmlRendererService);
  private readonly templateService = inject(TemplateService);

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  openPreview(): void {
    const html = this.renderer.render(this.templateService.template());
    this.previewHtml.set(html);
    this.activeTab.set('preview');
  }

  setWidth(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.previewWidth.set(val === '100%' ? '100%' : `${val}px`);
  }

  async copyHtml(): Promise<void> {
    await navigator.clipboard.writeText(this.previewHtml());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  downloadHtml(): void {
    const blob = new Blob([this.previewHtml()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.templateService.template().name.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onSaved(event: TemplateSavedEvent): void {
    this.lastSaved.set(new Date().toLocaleTimeString());
    console.log('Template saved:', event.templateId);
  }

  onExported(event: TemplateExportedEvent): void {
    console.log('Exported HTML length:', event.html.length);
  }
}
