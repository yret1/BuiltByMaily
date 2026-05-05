export type BlockType =
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'html';

export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  locked?: boolean;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  padding: Spacing;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  width: number | 'full';
  align: 'left' | 'center' | 'right';
  link?: string;
  padding: Spacing;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  label: string;
  href: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  align: 'left' | 'center' | 'right';
  padding: Spacing;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  color: string;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted';
  padding: Spacing;
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  height: number;
}

export interface ColumnDef {
  width: number;
  blocks: AnyBlock[];
}

export interface ColumnsBlock extends BaseBlock {
  type: 'columns';
  columns: ColumnDef[];
  gap: number;
  padding: Spacing;
}

export interface HtmlBlock extends BaseBlock {
  type: 'html';
  content: string;
}

export type AnyBlock =
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock
  | ColumnsBlock
  | HtmlBlock;

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

/** Default spacing value */
export const DEFAULT_SPACING: Spacing = { top: 0, right: 0, bottom: 0, left: 0 };

/** Creates a blank EmailTemplate with sensible defaults */
export function createBlankTemplate(id: string, name: string): EmailTemplate {
  return {
    id,
    name,
    backgroundColor: '#ffffff',
    contentWidth: 600,
    fontFamily: 'Arial, sans-serif',
    blocks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
