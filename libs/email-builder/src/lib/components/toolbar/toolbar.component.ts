import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../../services/template.service';
import type { BlockType } from '../../schema/block.types';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'text',    label: 'Text',    icon: '¶' },
  { type: 'image',   label: 'Image',   icon: '🖼' },
  { type: 'button',  label: 'Button',  icon: '⬛' },
  { type: 'divider', label: 'Divider', icon: '—' },
  { type: 'spacer',  label: 'Spacer',  icon: '↕' },
  { type: 'columns', label: 'Columns', icon: '⊟' },
  { type: 'html',    label: 'HTML',    icon: '</>' },
];

@Component({
  selector: 'emb-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="emb-toolbar">
      <div class="emb-toolbar__header">
        <span class="emb-toolbar__title">Blocks</span>
      </div>

      <ul class="emb-toolbar__list">
        @for (item of blockTypes; track item.type) {
          <li
            class="emb-toolbar__item"
            draggable="true"
            (dragstart)="onDragStart($event, item.type)"
            (click)="addBlock(item.type)"
            role="button"
            tabindex="0"
            [attr.aria-label]="'Add ' + item.label + ' block'"
            (keydown.enter)="addBlock(item.type)"
          >
            <span class="emb-toolbar__item-icon">{{ item.icon }}</span>
            <span class="emb-toolbar__item-label">{{ item.label }}</span>
          </li>
        }
      </ul>

      <div class="emb-toolbar__actions">
        <button
          class="emb-toolbar__btn"
          (click)="undo()"
          [disabled]="!canUndo"
          title="Undo (Ctrl+Z)"
        >↩ Undo</button>
        <button
          class="emb-toolbar__btn"
          (click)="redo()"
          [disabled]="!canRedo"
          title="Redo (Ctrl+Y)"
        >↪ Redo</button>
      </div>
    </aside>
  `,
  styles: [`
    .emb-toolbar {
      width: 200px;
      background: var(--emb-sidebar-bg, #f8f9fa);
      border-right: 1px solid var(--emb-border, #dee2e6);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }
    .emb-toolbar__header {
      padding: 16px;
      border-bottom: 1px solid var(--emb-border, #dee2e6);
    }
    .emb-toolbar__title {
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--emb-text-muted, #6c757d);
    }
    .emb-toolbar__list {
      list-style: none;
      margin: 0;
      padding: 8px;
      flex: 1;
    }
    .emb-toolbar__item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: grab;
      transition: background 0.15s;
      user-select: none;
    }
    .emb-toolbar__item:hover {
      background: var(--emb-item-hover, #e9ecef);
    }
    .emb-toolbar__item:active { cursor: grabbing; }
    .emb-toolbar__item-icon { font-size: 16px; width: 20px; text-align: center; }
    .emb-toolbar__item-label { font-size: 14px; }
    .emb-toolbar__actions {
      padding: 12px;
      display: flex;
      gap: 8px;
      border-top: 1px solid var(--emb-border, #dee2e6);
    }
    .emb-toolbar__btn {
      flex: 1;
      padding: 6px;
      border: 1px solid var(--emb-border, #dee2e6);
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
    }
    .emb-toolbar__btn:disabled { opacity: 0.4; cursor: default; }
    .emb-toolbar__btn:not(:disabled):hover { background: #e9ecef; }
  `],
})
export class ToolbarComponent {
  protected readonly blockTypes = BLOCK_TYPES;
  private readonly templateService = inject(TemplateService);

  get canUndo() { return this.templateService.canUndo; }
  get canRedo() { return this.templateService.canRedo; }

  addBlock(type: BlockType): void {
    this.templateService.addBlock(type);
  }

  undo(): void { this.templateService.undo(); }
  redo(): void { this.templateService.redo(); }

  onDragStart(event: DragEvent, type: BlockType): void {
    event.dataTransfer?.setData('application/emb-block-type', type);
  }
}
