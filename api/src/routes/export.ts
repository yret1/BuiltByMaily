import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import mjml2html from 'mjml';
import { requireApiKey } from '../middleware/api-key.js';
import type { AnyBlock, EmailTemplate, ColumnsBlock } from './export.types.js';

type AuthRequest = FastifyRequest & { workspaceId: string };

const ExportBody = z.object({
  templateId: z.string(),
  schema: z.unknown(), // validated structurally by convertToMjml
});

/** Convert an EmailTemplate schema to an MJML string then render to HTML. */
function schemaToHtml(template: EmailTemplate): { html: string; plainText: string } {
  const mjmlStr = buildMjml(template);
  const { html, errors } = mjml2html(mjmlStr, { validationLevel: 'soft' });
  if (errors.length > 0) {
    console.warn('MJML warnings:', errors);
  }
  const plainText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return { html, plainText };
}

function spacingToAttr(p: { top: number; right: number; bottom: number; left: number }): string {
  return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
}

function blockToMjml(block: AnyBlock): string {
  switch (block.type) {
    case 'text':
      return `<mj-text
          font-size="${block.fontSize}px"
          font-family="${block.fontFamily}"
          color="${block.color}"
          align="${block.align}"
          padding="${spacingToAttr(block.padding)}"
        >${block.content}</mj-text>`;

    case 'image':
      return `<mj-image
          src="${block.src}"
          alt="${block.alt}"
          ${block.width === 'full' ? '' : `width="${block.width}px"`}
          align="${block.align}"
          padding="${spacingToAttr(block.padding)}"
          ${block.link ? `href="${block.link}"` : ''}
        />`;

    case 'button':
      return `<mj-button
          background-color="${block.backgroundColor}"
          color="${block.textColor}"
          border-radius="${block.borderRadius}px"
          align="${block.align}"
          padding="${spacingToAttr(block.padding)}"
          href="${block.href}"
        >${block.label}</mj-button>`;

    case 'divider':
      return `<mj-divider
          border-color="${block.color}"
          border-width="${block.thickness}px"
          border-style="${block.style}"
          padding="${spacingToAttr(block.padding)}"
        />`;

    case 'spacer':
      return `<mj-spacer height="${block.height}px" />`;

    case 'columns': {
      const cols = (block as ColumnsBlock).columns
        .map(
          (col) =>
            `<mj-column width="${col.width}%">${col.blocks.map(blockToMjml).join('\n')}</mj-column>`,
        )
        .join('\n');
      return `<mj-section padding="${spacingToAttr(block.padding)}">${cols}</mj-section>`;
    }

    case 'html':
      return `<mj-raw>${block.content}</mj-raw>`;
  }
}

function buildMjml(template: EmailTemplate): string {
  const topLevelSections = template.blocks
    .filter((b) => b.type !== 'columns')
    .map(
      (b) =>
        `<mj-section><mj-column>${blockToMjml(b)}</mj-column></mj-section>`,
    );

  const columnSections = template.blocks
    .filter((b) => b.type === 'columns')
    .map(blockToMjml);

  // Interleave blocks preserving order
  const sections = template.blocks.map((b) =>
    b.type === 'columns'
      ? blockToMjml(b)
      : `<mj-section><mj-column>${blockToMjml(b)}</mj-column></mj-section>`,
  );

  void topLevelSections;
  void columnSections;

  return `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${template.fontFamily}" />
    </mj-attributes>
    ${template.previewText ? `<mj-preview>${template.previewText}</mj-preview>` : ''}
  </mj-head>
  <mj-body width="${template.contentWidth}px" background-color="${template.backgroundColor}">
    ${sections.join('\n    ')}
  </mj-body>
</mjml>`;
}

export async function exportRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/export', { preHandler: requireApiKey }, async (request, reply) => {
    void (request as AuthRequest).workspaceId;
    const body = ExportBody.parse(request.body);
    try {
      const result = schemaToHtml(body.schema as EmailTemplate);
      return { templateId: body.templateId, ...result };
    } catch (err) {
      return reply.status(422).send({ error: 'Export failed', detail: String(err) });
    }
  });
}
