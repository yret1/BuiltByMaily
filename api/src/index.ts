import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth.js';
import { templateRoutes } from './routes/templates.js';
import { exportRoutes } from './routes/export.js';
import { apiKeyRoutes } from './routes/api-keys.js';
import { assetRoutes } from './routes/assets.js';

const fastify = Fastify({
  logger: {
    level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  },
});

// ── Plugins ──────────────────────────────────────────────────────────────────

await fastify.register(cors, {
  origin: process.env['NODE_ENV'] === 'production'
    ? [/\.yourapp\.com$/]
    : true,
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
});

// Decorator used by JWT-protected routes
fastify.decorate('authenticate', async function (request: Parameters<typeof fastify.jwt.verify>[0], reply: { status: (n: number) => { send: (b: unknown) => void } }) {
  try {
    await (request as { jwtVerify(): Promise<void> }).jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────

const PREFIX = '/api/v1';

await fastify.register(authRoutes, { prefix: PREFIX });
await fastify.register(templateRoutes, { prefix: PREFIX });
await fastify.register(exportRoutes, { prefix: PREFIX });
await fastify.register(apiKeyRoutes, { prefix: PREFIX });
await fastify.register(assetRoutes, { prefix: PREFIX });

fastify.get('/health', async () => ({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────────────────────

const port = Number(process.env['PORT'] ?? 3000);
const host = process.env['HOST'] ?? '0.0.0.0';

try {
  await fastify.listen({ port, host });
  fastify.log.info(`API running at http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
