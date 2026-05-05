import { Injectable, signal, computed } from '@angular/core';
import { nanoid } from 'nanoid';
import type { AnyBlock, BlockType, EmailTemplate } from '../schema/block.types';
import { createBlankTemplate } from '../schema/block.types';
import { createDefaultBlock } from '../schema/block.defaults';
import { HistoryService } from './history.service';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly _template = signal<EmailTemplate>(
    createBlankTemplate(nanoid(10), 'Untitled Template')
  );

  readonly template = this._template.asReadonly();
  readonly blocks = computed(() => this._template().blocks);

  constructor(private history: HistoryService) {}

  /** Replace the entire template (e.g., when loading from API). */
  load(template: EmailTemplate): void {
    this.history.clear();
    this._template.set(structuredClone(template));
  }

  /** Patch top-level template properties (backgroundColor, name, etc.). */
  patchTemplate(patch: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'blocks'>>): void {
    this._snapshot();
    this._template.update((t) => ({ ...t, ...patch, updatedAt: new Date().toISOString() }));
  }

  /** Add a new block of the given type at the specified index (default: end). */
  addBlock(type: BlockType, atIndex?: number): string {
    const id = nanoid(10);
    const block = createDefaultBlock(type, id);
    this._snapshot();
    this._template.update((t) => {
      const blocks = [...t.blocks];
      const index = atIndex ?? blocks.length;
      blocks.splice(index, 0, block);
      return { ...t, blocks, updatedAt: new Date().toISOString() };
    });
    return id;
  }

  /** Remove a block by id. */
  removeBlock(id: string): void {
    this._snapshot();
    this._template.update((t) => ({
      ...t,
      blocks: t.blocks.filter((b) => b.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  }

  /** Update a block's properties (shallow merge of the block itself). */
  updateBlock(id: string, patch: Partial<AnyBlock>): void {
    this._snapshot();
    this._template.update((t) => ({
      ...t,
      blocks: t.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as AnyBlock) : b)),
      updatedAt: new Date().toISOString(),
    }));
  }

  /** Reorder blocks (CDK drag-drop gives previousIndex / currentIndex). */
  moveBlock(previousIndex: number, currentIndex: number): void {
    this._snapshot();
    this._template.update((t) => {
      const blocks = [...t.blocks];
      const [moved] = blocks.splice(previousIndex, 1);
      blocks.splice(currentIndex, 0, moved);
      return { ...t, blocks, updatedAt: new Date().toISOString() };
    });
  }

  undo(): void {
    const prev = this.history.undo(this._template());
    if (prev) this._template.set(prev);
  }

  redo(): void {
    const next = this.history.redo(this._template());
    if (next) this._template.set(next);
  }

  get canUndo() { return this.history.canUndo; }
  get canRedo() { return this.history.canRedo; }

  private _snapshot(): void {
    this.history.push(this._template());
  }
}
