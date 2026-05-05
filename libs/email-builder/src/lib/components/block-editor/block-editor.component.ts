import { Component, inject, input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TemplateService } from '../../services/template.service';
import type { AnyBlock } from '../../schema/block.types';

@Component({
  selector: 'emb-block-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <aside class="emb-editor">
      <div class="emb-editor__header">
        <span class="emb-editor__title">
          {{ block() ? (block()!.type | titlecase) + ' Block' : 'Properties' }}
        </span>
      </div>

      @if (!block()) {
        <div class="emb-editor__empty">
          <p>Select a block on the canvas to edit its properties.</p>
        </div>
      }

      @if (block() && form) {
        <form class="emb-editor__form" [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- TEXT block fields -->
          @if (block()!.type === 'text') {
            <div class="emb-editor__group">
              <label class="emb-editor__label">Content (HTML)</label>
              <textarea class="emb-editor__textarea" formControlName="content" rows="6"></textarea>
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Font size (px)</label>
              <input class="emb-editor__input" type="number" formControlName="fontSize" min="8" max="96" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Color</label>
              <input class="emb-editor__input" type="color" formControlName="color" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Align</label>
              <select class="emb-editor__select" formControlName="align">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          }

          <!-- IMAGE block fields -->
          @if (block()!.type === 'image') {
            <div class="emb-editor__group">
              <label class="emb-editor__label">Image URL</label>
              <input class="emb-editor__input" type="url" formControlName="src" placeholder="https://..." />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Alt text</label>
              <input class="emb-editor__input" type="text" formControlName="alt" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Link URL</label>
              <input class="emb-editor__input" type="url" formControlName="link" placeholder="https://..." />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Align</label>
              <select class="emb-editor__select" formControlName="align">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          }

          <!-- BUTTON block fields -->
          @if (block()!.type === 'button') {
            <div class="emb-editor__group">
              <label class="emb-editor__label">Label</label>
              <input class="emb-editor__input" type="text" formControlName="label" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">URL</label>
              <input class="emb-editor__input" type="url" formControlName="href" placeholder="https://..." />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Background</label>
              <input class="emb-editor__input" type="color" formControlName="backgroundColor" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Text color</label>
              <input class="emb-editor__input" type="color" formControlName="textColor" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Border radius (px)</label>
              <input class="emb-editor__input" type="number" formControlName="borderRadius" min="0" max="50" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Align</label>
              <select class="emb-editor__select" formControlName="align">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          }

          <!-- DIVIDER block fields -->
          @if (block()!.type === 'divider') {
            <div class="emb-editor__group">
              <label class="emb-editor__label">Color</label>
              <input class="emb-editor__input" type="color" formControlName="color" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Thickness (px)</label>
              <input class="emb-editor__input" type="number" formControlName="thickness" min="1" max="20" />
            </div>
            <div class="emb-editor__group">
              <label class="emb-editor__label">Style</label>
              <select class="emb-editor__select" formControlName="style">
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          }

          <!-- SPACER block fields -->
          @if (block()!.type === 'spacer') {
            <div class="emb-editor__group">
              <label class="emb-editor__label">Height (px)</label>
              <input class="emb-editor__input" type="number" formControlName="height" min="4" max="400" />
            </div>
          }

          <!-- HTML block fields -->
          @if (block()!.type === 'html') {
            <div class="emb-editor__group">
              <label class="emb-editor__label">Raw HTML</label>
              <textarea class="emb-editor__textarea" formControlName="content" rows="10" spellcheck="false"></textarea>
            </div>
          }

          <div class="emb-editor__footer">
            <button class="emb-editor__apply-btn" type="submit">Apply changes</button>
          </div>
        </form>
      }
    </aside>
  `,
  styles: [`
    .emb-editor {
      width: 240px;
      background: var(--emb-sidebar-bg, #f8f9fa);
      border-left: 1px solid var(--emb-border, #dee2e6);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }
    .emb-editor__header {
      padding: 16px;
      border-bottom: 1px solid var(--emb-border, #dee2e6);
    }
    .emb-editor__title {
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--emb-text-muted, #6c757d);
    }
    .emb-editor__empty {
      padding: 24px 16px;
      color: var(--emb-text-muted, #aaa);
      font-size: 13px;
    }
    .emb-editor__form { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
    .emb-editor__group { display: flex; flex-direction: column; gap: 4px; }
    .emb-editor__label { font-size: 12px; color: var(--emb-text-muted, #6c757d); font-weight: 500; }
    .emb-editor__input,
    .emb-editor__select,
    .emb-editor__textarea {
      padding: 6px 8px;
      border: 1px solid var(--emb-border, #dee2e6);
      border-radius: 4px;
      font-size: 13px;
      width: 100%;
      box-sizing: border-box;
      background: white;
    }
    .emb-editor__textarea { resize: vertical; font-family: monospace; }
    .emb-editor__input[type="color"] { padding: 2px 4px; height: 32px; cursor: pointer; }
    .emb-editor__footer { padding-top: 8px; }
    .emb-editor__apply-btn {
      width: 100%;
      padding: 8px;
      background: var(--emb-primary, #007bff);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .emb-editor__apply-btn:hover { filter: brightness(1.1); }
  `],
})
export class BlockEditorComponent implements OnChanges {
  readonly block = input<AnyBlock | null>(null);

  protected form: FormGroup | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly templateService = inject(TemplateService);

  ngOnChanges(): void {
    const b = this.block();
    if (!b) { this.form = null; return; }
    this.form = this.fb.group({ ...b });
  }

  onSubmit(): void {
    const b = this.block();
    if (!b || !this.form) return;
    this.templateService.updateBlock(b.id, this.form.getRawValue());
  }
}
