import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { db } from '../db/client.js';
import { apiKeys, workspaces } from '../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';

/** Fastify preHandler: validates X-API-Key and attaches workspaceId to request. */
export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const raw = request.headers['x-api-key'];
  if (!raw || typeof raw !== 'string') {
    return reply.status(401).send({ error: 'Missing X-API-Key header' });
  }

  // Key format: emb_live_<prefix>_<secret>
  // We look up candidates by prefix to avoid full-table bcrypt scan
  const parts = raw.split('_');
  const prefix = parts.slice(0, 3).join('_'); // emb_live_<prefix>

  const rows = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyPrefix, prefix), isNull(apiKeys.revokedAt)));

  const matched = await Promise.all(
    rows.map(async (row) => {
      const ok = await bcrypt.compare(raw, row.keyHash);
      return ok ? row : null;
    }),
  ).then((r) => r.find(Boolean));

  if (!matched) {
    return reply.status(401).send({ error: 'Invalid API key' });
  }

  // Touch lastUsedAt without blocking the request
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, matched.id))
    .execute()
    .catch(() => undefined);

  (request as FastifyRequest & { workspaceId: string }).workspaceId = matched.workspaceId!;
}
