import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db } from '../db/client.js';
import { apiKeys } from '../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';

type JwtRequest = FastifyRequest & { user: { sub: string; workspaceId: string } };

const CreateKeyBody = z.object({ label: z.string().optional() });

export async function apiKeyRoutes(fastify: FastifyInstance): Promise<void> {
  const jwtOpts = { preHandler: fastify.authenticate };

  fastify.get('/api-keys', jwtOpts, async (request) => {
    const req = request as JwtRequest;
    return db
      .select({
        id: apiKeys.id,
        keyPrefix: apiKeys.keyPrefix,
        label: apiKeys.label,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.workspaceId, req.user.workspaceId), isNull(apiKeys.revokedAt)));
  });

  fastify.post('/api-keys', jwtOpts, async (request, reply) => {
    const req = request as JwtRequest;
    const body = CreateKeyBody.parse(request.body);

    const prefix = `emb_live_${nanoid(8)}`;
    const secret = nanoid(24);
    const fullKey = `${prefix}_${secret}`;
    const keyHash = await bcrypt.hash(fullKey, 12);
    const id = nanoid(10);

    await db.insert(apiKeys).values({
      id,
      workspaceId: req.user.workspaceId,
      keyHash,
      keyPrefix: prefix,
      label: body.label ?? null,
    });

    // Return the raw key only once — it cannot be retrieved again
    return reply.status(201).send({ id, key: fullKey, prefix });
  });

  fastify.delete('/api-keys/:id', jwtOpts, async (request, reply) => {
    const req = request as JwtRequest;
    const { id } = request.params as { id: string };

    const [row] = await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.workspaceId, req.user.workspaceId)))
      .returning();

    if (!row) return reply.status(404).send({ error: 'API key not found' });
    return reply.status(204).send();
  });
}
