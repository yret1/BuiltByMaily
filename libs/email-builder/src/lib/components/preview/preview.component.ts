import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../../services/template.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'emb-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="emb-preview">
      <div class="emb-preview__toolbar">
        <button
          class="emb-preview__btn"
          (click)="exportHtml()"
          [disabled]="loading()"
        >
          {{ loading() ? 'Exporting…' : 'Export HTML' }}
        </button>

        @if (error()) {
          <span class="emb-preview__error">{{ error() }}</span>
        }
      </div>

      @if (html()) {
        <iframe
          class="emb-preview__frame"
          [srcdoc]="html()!"
          sandbox="allow-same-origin"
          title="Email preview"
        ></iframe>
      }
    </div>
  `,
  styles: [`
    .emb-preview { display: flex; flex-direction: column; height: 100%; }
    .emb-preview__toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--emb-border, #dee2e6);
      background: var(--emb-sidebar-bg, #f8f9fa);
    }
    .emb-preview__btn {
      padding: 6px 14px;
      background: var(--emb-primary, #007bff);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .emb-preview__btn:disabled { opacity: 0.6; cursor: default; }
    .emb-preview__error { color: #dc3545; font-size: 13px; }
    .emb-preview__frame { flex: 1; border: none; width: 100%; }
  `],
})
export class PreviewComponent {
  protected readonly html = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly templateService = inject(TemplateService);
  private readonly apiService = inject(ApiService);

  exportHtml(): void {
    this.loading.set(true);
    this.error.set(null);
    const schema = this.templateService.template();
    this.apiService.exportTemplate(schema.id, { schema }).subscribe({
      next: (res) => {
        this.html.set(res.html);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Export failed';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }
}
