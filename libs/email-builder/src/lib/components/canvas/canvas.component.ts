import {
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TemplateService } from '../../services/template.service';
import type { AnyBlock, BlockType } from '../../schema/block.types';
import { BlockRendererComponent } from './block-renderer.component';

@Component({
  selector: 'emb-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule, BlockRendererComponent],
  template: `
    <div
      class="emb-canvas"
      [style.background-color]="template().backgroundColor"
      (dragover)="onDragOver($event)"
      (drop)="onExternalDrop($event)"
    >
      <div
        class="emb-canvas__body"
        [style.max-width.px]="template().contentWidth"
        cdkDropList
        (cdkDropListDropped)="onCdkDrop($event)"
      >
        @if (blocks().length === 0) {
          <div class="emb-canvas__empty">
            <p>Drag blocks from the left panel or click to add them.</p>
          </div>
        }

        @for (block of blocks(); track block.id) {
          <div
            cdkDrag
            class="emb-canvas__block"
            [class.emb-canvas__block--selected]="selectedBlockId() === block.id"
            (click)="selectBlock(block.id)"
            (keydown.enter)="selectBlock(block.id)"
            role="button"
            tabindex="0"
            [attr.aria-label]="'Edit ' + block.type + ' block'"
          >
            <div class="emb-canvas__block-drag-handle" cdkDragHandle>⠿</div>
            <emb-block-renderer [block]="block" />
            <div class="emb-canvas__block-actions">
              <button
                class="emb-canvas__action-btn"
                (click)="removeBlock($event, block.id)"
                aria-label="Delete block"
                title="Delete block"
              >✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .emb-canvas {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      min-height: 100%;
    }
    .emb-canvas__body {
      margin: 0 auto;
      background: white;
      min-height: 400px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .emb-canvas__empty {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: var(--emb-text-muted, #aaa);
      font-size: 14px;
      border: 2px dashed var(--emb-border, #dee2e6);
      border-radius: 4px;
      margin: 24px;
    }
    .emb-canvas__block {
      position: relative;
      border: 2px solid transparent;
      transition: border-color 0.15s;
      cursor: pointer;
    }
    .emb-canvas__block:hover {
      border-color: var(--emb-primary, #007bff);
    }
    .emb-canvas__block--selected {
      border-color: var(--emb-primary, #007bff) !important;
    }
    .emb-canvas__block-drag-handle {
      position: absolute;
      left: -24px;
      top: 50%;
      transform: translateY(-50%);
      cursor: grab;
      color: var(--emb-text-muted, #aaa);
      font-size: 18px;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .emb-canvas__block:hover .emb-canvas__block-drag-handle { opacity: 1; }
    .emb-canvas__block-actions {
      position: absolute;
      top: 4px;
      right: 4px;
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .emb-canvas__block:hover .emb-canvas__block-actions,
    .emb-canvas__block--selected .emb-canvas__block-actions { opacity: 1; }
    .emb-canvas__action-btn {
      background: white;
      border: 1px solid var(--emb-border, #dee2e6);
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .emb-canvas__action-btn:hover { background: #ffe0e0; border-color: #f00; }

    /* CDK drag-drop preview */
    .cdk-drag-preview {
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      opacity: 0.9;
    }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .emb-canvas__body.cdk-drop-list-dragging .emb-canvas__block:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
})
export class CanvasComponent {
  readonly blockSelected = output<string | null>();

  protected readonly templateService = inject(TemplateService);
  protected readonly template = this.templateService.template;
  protected readonly blocks = this.templateService.blocks;
  protected readonly selectedBlockId = signal<string | null>(null);

  selectBlock(id: string): void {
    this.selectedBlockId.set(id);
    this.blockSelected.emit(id);
  }

  removeBlock(event: Event, id: string): void {
    event.stopPropagation();
    if (this.selectedBlockId() === id) {
      this.selectedBlockId.set(null);
      this.blockSelected.emit(null);
    }
    this.templateService.removeBlock(id);
  }

  onCdkDrop(event: CdkDragDrop<AnyBlock[]>): void {
    this.templateService.moveBlock(event.previousIndex, event.currentIndex);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /** Handles drops from the toolbar (HTML5 drag-drop, not CDK). */
  onExternalDrop(event: DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer?.getData('application/emb-block-type') as BlockType | undefined;
    if (type) {
      const id = this.templateService.addBlock(type);
      this.selectBlock(id);
    }
  }
}
