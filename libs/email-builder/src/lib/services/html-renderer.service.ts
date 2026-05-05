import { Injectable } from '@angular/core';
import type {
  AnyBlock,
  ButtonBlock,
  ColumnsBlock,
  DividerBlock,
  EmailTemplate,
  HtmlBlock,
  ImageBlock,
  SpacerBlock,
  Spacing,
  TextBlock,
} from '../schema/block.types';

/**
 * Renders an EmailTemplate schema to email-compatible HTML (table-based,
 * inline styles) entirely in the browser — no API or MJML required.
 * Output is suitable for testing in an iframe or downloading.
 */
@Injectable({ providedIn: 'root' })
export class HtmlRendererService {
  render(template: EmailTemplate): string {
    const body = template.blocks.map((b) => this.renderBlock(b, template)).join('\n');

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${esc(template.name)}</title>
  ${template.previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${esc(template.previewText)}&zwnj;&nbsp;</div>` : ''}
  <style>
    body { margin: 0; padding: 0; background-color: ${template.backgroundColor}; font-family: ${template.fontFamily}; }
    img { border: 0; outline: none; text-decoration: none; }
    a { color: inherit; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .col-block { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${template.backgroundColor};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="background-color:${template.backgroundColor};">
    <tr>
      <td align="center">
        <table class="email-container" role="presentation" cellpadding="0" cellspacing="0" border="0"
               width="${template.contentWidth}" style="max-width:${template.contentWidth}px;width:100%;background-color:#ffffff;">
          <tr><td>${body}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private renderBlock(block: AnyBlock, template: EmailTemplate): string {
    switch (block.type) {
      case 'text':    return this.renderText(block);
      case 'image':   return this.renderImage(block);
      case 'button':  return this.renderButton(block);
      case 'divider': return this.renderDivider(block);
      case 'spacer':  return this.renderSpacer(block);
      case 'columns': return this.renderColumns(block, template);
      case 'html':    return this.renderHtml(block);
    }
  }

  private renderText(b: TextBlock): string {
    return `<div style="padding:${sp(b.padding)};font-size:${b.fontSize}px;font-family:${b.fontFamily};color:${b.color};text-align:${b.align};">
  ${b.content}
</div>`;
  }

  private renderImage(b: ImageBlock): string {
    const width = b.width === 'full' ? '100%' : `${b.width}px`;
    const img = b.src
      ? `<img src="${esc(b.src)}" alt="${esc(b.alt)}" width="${b.width === 'full' ? '100%' : b.width}" style="display:block;${b.width === 'full' ? 'width:100%;' : `width:${b.width}px;`}max-width:100%;border:0;" />`
      : `<div style="background:#f0f0f0;border:2px dashed #ccc;padding:40px 20px;text-align:center;color:#999;font-size:14px;font-family:Arial,sans-serif;">[ Image placeholder ]</div>`;

    const linked = b.link ? `<a href="${esc(b.link)}" style="display:block;">${img}</a>` : img;
    return `<div style="padding:${sp(b.padding)};text-align:${b.align};">
  <div style="display:inline-block;max-width:100%;width:${width};">${linked}</div>
</div>`;
  }

  private renderButton(b: ButtonBlock): string {
    return `<div style="padding:${sp(b.padding)};text-align:${b.align};">
  <a href="${esc(b.href || '#')}"
     style="display:inline-block;padding:12px 24px;background-color:${b.backgroundColor};color:${b.textColor};text-decoration:none;border-radius:${b.borderRadius}px;font-family:Arial,sans-serif;font-size:16px;font-weight:600;line-height:1.2;">
    ${esc(b.label)}
  </a>
</div>`;
  }

  private renderDivider(b: DividerBlock): string {
    return `<div style="padding:${sp(b.padding)};">
  <div style="border-top:${b.thickness}px ${b.style} ${b.color};"></div>
</div>`;
  }

  private renderSpacer(b: SpacerBlock): string {
    return `<div style="height:${b.height}px;line-height:${b.height}px;">&nbsp;</div>`;
  }

  private renderColumns(b: ColumnsBlock, template: EmailTemplate): string {
    const totalWidth = template.contentWidth - b.padding.left - b.padding.right;
    const cols = b.columns
      .map((col) => {
        const colWidth = Math.round((totalWidth * col.width) / 100);
        const colContent = col.blocks.map((cb) => this.renderBlock(cb, template)).join('');
        return `<td class="col-block" valign="top" width="${colWidth}" style="width:${colWidth}px;vertical-align:top;">${colContent || '&nbsp;'}</td>`;
      })
      .join(`<td width="${b.gap}" style="width:${b.gap}px;">&nbsp;</td>`);

    return `<div style="padding:${sp(b.padding)};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>${cols}</tr>
  </table>
</div>`;
  }

  private renderHtml(b: HtmlBlock): string {
    return b.content;
  }
}

function sp(p: Spacing): string {
  return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
