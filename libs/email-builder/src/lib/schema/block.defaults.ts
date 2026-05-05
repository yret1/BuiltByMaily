import type {
  AnyBlock,
  BlockType,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  HtmlBlock,
} from './block.types';

const DEFAULT_PADDING = { top: 10, right: 20, bottom: 10, left: 20 };

/** Returns a new block with default values for the given type. */
export function createDefaultBlock(type: BlockType, id: string): AnyBlock {
  switch (type) {
    case 'text':
      return {
        id,
        type,
        content: '<p>Enter your text here</p>',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        align: 'left',
        padding: DEFAULT_PADDING,
      } satisfies TextBlock;

    case 'image':
      return {
        id,
        type,
        src: '',
        alt: '',
        width: 'full',
        align: 'center',
        padding: DEFAULT_PADDING,
      } satisfies ImageBlock;

    case 'button':
      return {
        id,
        type,
        label: 'Click here',
        href: '',
        backgroundColor: '#007bff',
        textColor: '#ffffff',
        borderRadius: 4,
        align: 'center',
        padding: DEFAULT_PADDING,
      } satisfies ButtonBlock;

    case 'divider':
      return {
        id,
        type,
        color: '#cccccc',
        thickness: 1,
        style: 'solid',
        padding: { top: 10, right: 0, bottom: 10, left: 0 },
      } satisfies DividerBlock;

    case 'spacer':
      return {
        id,
        type,
        height: 20,
      } satisfies SpacerBlock;

    case 'columns':
      return {
        id,
        type,
        columns: [
          { width: 50, blocks: [] },
          { width: 50, blocks: [] },
        ],
        gap: 20,
        padding: DEFAULT_PADDING,
      } satisfies ColumnsBlock;

    case 'html':
      return {
        id,
        type,
        content: '<!-- Custom HTML -->',
      } satisfies HtmlBlock;
  }
}
