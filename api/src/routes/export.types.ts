/** Shared type definitions mirrored from the SDK schema, used only in the API. */

export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ColumnDef {
  width: number;
  blocks: AnyBlock[];
}

export type AnyBlock =
  | { type: 'text'; id: string; content: string; fontSize: number; fontFamily: string; color: string; align: 'left' | 'center' | 'right'; padding: Spacing }
  | { type: 'image'; id: string; src: string; alt: string; width: number | 'full'; align: 'left' | 'center' | 'right'; link?: string; padding: Spacing }
  | { type: 'button'; id: string; label: string; href: string; backgroundColor: string; textColor: string; borderRadius: number; align: 'left' | 'center' | 'right'; padding: Spacing }
  | { type: 'divider'; id: string; color: string; thickness: number; style: 'solid' | 'dashed' | 'dotted'; padding: Spacing }
  | { type: 'spacer'; id: string; height: number }
  | ColumnsBlock
  | { type: 'html'; id: string; content: string };

export interface ColumnsBlock {
  type: 'columns';
  id: string;
  columns: ColumnDef[];
  gap: number;
  padding: Spacing;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject?: string;
  previewText?: string;
  backgroundColor: string;
  contentWidth: number;
  fontFamily: string;
  blocks: AnyBlock[];
  createdAt: string;
  updatedAt: string;
}
