import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from '../db/client.js';
import { templates } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireApiKey } from '../middleware/api-key.js';

type AuthRequest = FastifyRequest & { workspaceId: string };

const SpacingSchema = z.object({
  top: z.number(),
  right: z.number(),
  bottom: z.number(),
  left: z.number(),
});

// Recursive block schema validated at the route level
const AnyBlockSchema: z.ZodType = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ id: z.string(), type: z.literal('text'), content: z.string(), fontSize: z.number(), fontFamily: z.string(), color: z.string(), align: z.enum(['left', 'center', 'right']), padding: SpacingSchema, locked: z.boolean().optional() }),
    z.object({ id: z.string(), type: z.literal('image'), src: z.string(), alt: z.string(), width: z.union([z.number(), z.literal('full')]), align: z.enum(['left', 'center', 'right']), link: z.string().optional(), padding: SpacingSchema, locked: z.boolean().optional() }),
    z.object({ id: z.string(), type: z.literal('button'), label: z.string(), href: z.string(), backgroundColor: z.string(), textColor: z.string(), borderRadius: z.number(), align: z.enum(['left', 'center', 'right']), padding: SpacingSchema, locked: z.boolean().optional() }),
    z.object({ id: z.string(), type: z.literal('divider'), color: z.string(), thickness: z.number(), style: z.enum(['solid', 'dashed', 'dotted']), padding: SpacingSchema, locked: z.boolean().optional() }),
    z.object({ id: z.string(), type: z.literal('spacer'), height: z.number(), locked: z.boolean().optional() }),
    z.object({ id: z.string(), type: z.literal('columns'), columns: z.array(z.object({ width: z.number(), blocks: z.array(AnyBlockSchema) })), gap: z.number(), padding: SpacingSchema, locked: z.boolean().optional() }),
    z.object({ id: z.string(), type: z.literal('html'), content: z.string(), locked: z.boolean().optional() }),
  ])
);

const EmailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string().optional(),
  previewText: z.string().optional(),
  backgroundColor: z.string(),
  contentWidth: z.number(),
  fontFamily: z.string(),
  blocks: z.array(AnyBlockSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateTemplateBody = z.object({
  name: z.string().min(1),
  schema: EmailTemplateSchema,
  workspaceId: z.string().optional(),
});

const UpdateTemplateBody = z.object({
  name: z.string().min(1),
  schema: EmailTemplateSchema,
});

const PatchTemplateBody = z.object({
  name: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

export async function templateRoutes(fastify: FastifyInstance): Promise<void> {
  const opts = { preHandler: requireApiKey };

  // List templates
  fastify.get('/templates', opts, async (request) => {
    const req = request as AuthRequest;
    return db.select().from(templates).where(eq(templates.workspaceId, req.workspaceId));
  });

  // Get single template
  fastify.get('/templates/:id', opts, async (request, reply) => {
    const req = request as AuthRequest;
    const { id } = request.params as { id: string };
    const [row] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.workspaceId, req.workspaceId)));

    if (!row) return reply.status(404).send({ error: 'Template not found' });
    return row;
  });

  // Create template
  fastify.post('/templates', opts, async (request, reply) => {
    const req = request as AuthRequest;
    const body = CreateTemplateBody.parse(request.body);
    const id = nanoid(10);

    const [row] = await db
      .insert(templates)
      .values({
        id,
        workspaceId: req.workspaceId,
        name: body.name,
        schema: body.schema,
      })
      .returning();

    return reply.status(201).send(row);
  });

  // Full replace
  fastify.put('/templates/:id', opts, async (request, reply) => {
    const req = request as AuthRequest;
    const { id } = request.params as { id: string };
    const body = UpdateTemplateBody.parse(request.body);

    const [row] = await db
      .update(templates)
      .set({ name: body.name, schema: body.schema, updatedAt: new Date() })
      .where(and(eq(templates.id, id), eq(templates.workspaceId, req.workspaceId)))
      .returning();

    if (!row) return reply.status(404).send({ error: 'Template not found' });
    return row;
  });

  // Partial update (rename / tag)
  fastify.patch('/templates/:id', opts, async (request, reply) => {
    const req = request as AuthRequest;
    const { id } = request.params as { id: string };
    const body = PatchTemplateBody.parse(request.body);

    const [row] = await db
      .update(templates)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(templates.id, id), eq(templates.workspaceId, req.workspaceId)))
      .returning();

    if (!row) return reply.status(404).send({ error: 'Template not found' });
    return row;
  });

  // Delete template
  fastify.delete('/templates/:id', opts, async (request, reply) => {
    const req = request as AuthRequest;
    const { id } = request.params as { id: string };

    const [row] = await db
      .delete(templates)
      .where(and(eq(templates.id, id), eq(templates.workspaceId, req.workspaceId)))
      .returning();

    if (!row) return reply.status(404).send({ error: 'Template not found' });
    return reply.status(204).send();
  });
}
