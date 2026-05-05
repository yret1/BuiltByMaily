import {
  Component,
  inject,
  input,
  output,
  effect,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateService } from './services/template.service';
import { ApiService } from './services/api.service';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { BlockEditorComponent } from './components/block-editor/block-editor.component';
import type { BuilderConfig, TemplateSavedEvent, TemplateExportedEvent } from './schema/builder-config.types';
import type { AnyBlock } from './schema/block.types';

@Component({
  selector: 'emb-email-builder',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, CanvasComponent, BlockEditorComponent],
  template: `
    <div class="emb-root" [class.emb-root--loading]="loading()">
      @if (loading()) {
        <div class="emb-root__loader">Loading…</div>
      }

      <emb-toolbar />

      <main class="emb-root__main">
        <div class="emb-root__topbar">
          <input
            class="emb-root__name-input"
            type="text"
            [value]="templateService.template().name"
            (change)="onNameChange($event)"
            placeholder="Template name"
            aria-label="Template name"
          />
          <div class="emb-root__topbar-actions">
            <button class="emb-root__btn emb-root__btn--save" (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>

        <emb-canvas (blockSelected)="onBlockSelected($event)" />
      </main>

      <emb-block-editor [block]="selectedBlock()" />
    </div>
  `,
  styles: [`
    :host {
      --emb-primary: #007bff;
      --emb-border: #dee2e6;
      --emb-sidebar-bg: #f8f9fa;
      --emb-text-muted: #6c757d;
      display: block;
      height: 100%;
    }
    .emb-root {
      display: flex;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
    }
    .emb-root--loading::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.7);
      z-index: 100;
    }
    .emb-root__loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 101;
      font-size: 16px;
      color: #333;
    }
    .emb-root__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .emb-root__topbar {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid var(--emb-border);
      background: white;
      gap: 12px;
    }
    .emb-root__name-input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--emb-border);
      border-radius: 4px;
      font-size: 14px;
      max-width: 300px;
    }
    .emb-root__topbar-actions { display: flex; gap: 8px; }
    .emb-root__btn {
      padding: 7px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .emb-root__btn--save {
      background: var(--emb-primary);
      color: white;
    }
    .emb-root__btn--save:disabled { opacity: 0.6; cursor: default; }
    .emb-root__btn--save:not(:disabled):hover { filter: brightness(1.1); }
  `],
})
export class EmailBuilderComponent implements OnInit {
  readonly apiKey = input.required<string>();
  readonly workspaceId = input.required<string>();
  readonly templateId = input<string | null>(null);
  readonly config = input<BuilderConfig>({});

  readonly templateSaved = output<TemplateSavedEvent>();
  readonly templateExported = output<TemplateExportedEvent>();
  readonly change = output<ReturnType<TemplateService['template']>>();

  protected readonly templateService = inject(TemplateService);
  private readonly apiService = inject(ApiService);

  protected loading = () => this._loading;
  protected saving = () => this._saving;
  private _loading = false;
  private _saving = false;

  private selectedBlockId: string | null = null;
  protected readonly selectedBlock = computed<AnyBlock | null>(() => {
    if (!this.selectedBlockId) return null;
    return this.templateService.blocks().find((b) => b.id === this.selectedBlockId) ?? null;
  });

  constructor() {
    effect(() => {
      // Emit change event whenever the template signal updates
      this.change.emit(this.templateService.template());
    });
  }

  ngOnInit(): void {
    this.apiService.configure(this.apiKey(), this.workspaceId());
    const tid = this.templateId();
    if (tid) {
      this._loading = true;
      this.apiService.getTemplate(tid).subscribe({
        next: (t) => { this.templateService.load(t); this._loading = false; },
        error: () => { this._loading = false; },
      });
    }
  }

  onBlockSelected(id: string | null): void {
    this.selectedBlockId = id;
  }

  onNameChange(event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    this.templateService.patchTemplate({ name });
  }

  save(): void {
    this._saving = true;
    const schema = this.templateService.template();
    this.apiService.saveTemplate(schema.id, { name: schema.name, schema }).subscribe({
      next: (saved) => {
        this._saving = false;
        this.templateSaved.emit({ templateId: saved.id, name: saved.name, schema: saved });
      },
      error: () => { this._saving = false; },
    });
  }
}
