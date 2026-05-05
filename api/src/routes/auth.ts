import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db } from '../db/client.js';
import { users, workspaces } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(1),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/auth/register', async (request, reply) => {
    const body = RegisterBody.parse(request.body);

    const existing = await db.select().from(users).where(eq(users.email, body.email));
    if (existing.length > 0) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    const workspaceId = nanoid(10);
    const userId = nanoid(10);
    const passwordHash = await bcrypt.hash(body.password, 12);

    await db.insert(workspaces).values({
      id: workspaceId,
      name: body.workspaceName,
      plan: 'free',
    });

    await db.insert(users).values({
      id: userId,
      workspaceId,
      email: body.email,
      passwordHash,
      role: 'owner',
    });

    const token = fastify.jwt.sign({ sub: userId, workspaceId }, { expiresIn: '15m' });
    const refreshToken = fastify.jwt.sign(
      { sub: userId, workspaceId, type: 'refresh' },
      { expiresIn: '30d' },
    );

    return reply.status(201).send({ token, refreshToken, workspaceId });
  });

  fastify.post('/auth/login', async (request, reply) => {
    const body = LoginBody.parse(request.body);

    const [user] = await db.select().from(users).where(eq(users.email, body.email));
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign(
      { sub: user.id, workspaceId: user.workspaceId },
      { expiresIn: '15m' },
    );
    const refreshToken = fastify.jwt.sign(
      { sub: user.id, workspaceId: user.workspaceId, type: 'refresh' },
      { expiresIn: '30d' },
    );

    return { token, refreshToken };
  });

  fastify.post('/auth/refresh', async (request, reply) => {
    const body = z.object({ refreshToken: z.string() }).parse(request.body);
    try {
      const payload = fastify.jwt.verify<{
        sub: string;
        workspaceId: string;
        type: string;
      }>(body.refreshToken);

      if (payload.type !== 'refresh') {
        return reply.status(401).send({ error: 'Not a refresh token' });
      }

      const token = fastify.jwt.sign(
        { sub: payload.sub, workspaceId: payload.workspaceId },
        { expiresIn: '15m' },
      );
      return { token };
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired refresh token' });
    }
  });
}
