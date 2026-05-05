import { Injectable } from '@angular/core';
import type { EmailTemplate } from '../schema/block.types';

const MAX_HISTORY = 50;

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private past: EmailTemplate[] = [];
  private future: EmailTemplate[] = [];

  /** Push a new state snapshot. Clears the redo stack. */
  push(state: EmailTemplate): void {
    this.past.push(structuredClone(state));
    if (this.past.length > MAX_HISTORY) {
      this.past.shift();
    }
    this.future = [];
  }

  /** Undo: returns the previous state, or null if at the beginning. */
  undo(current: EmailTemplate): EmailTemplate | null {
    const previous = this.past.pop();
    if (!previous) return null;
    this.future.push(structuredClone(current));
    return previous;
  }

  /** Redo: returns the next state, or null if at the end. */
  redo(current: EmailTemplate): EmailTemplate | null {
    const next = this.future.pop();
    if (!next) return null;
    this.past.push(structuredClone(current));
    return next;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /** Wipe all history (e.g., when a new template is loaded). */
  clear(): void {
    this.past = [];
    this.future = [];
  }
}
