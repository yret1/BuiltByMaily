import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from '../db/client.js';
import { assets } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireApiKey } from '../middleware/api-key.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type AuthRequest = FastifyRequest & { workspaceId: string };

const UploadUrlBody = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
});

function r2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env['R2_ACCESS_KEY_ID'] ?? '',
      secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'] ?? '',
    },
  });
}

export async function assetRoutes(fastify: FastifyInstance): Promise<void> {
  const opts = { preHandler: requireApiKey };

  fastify.post('/assets/upload-url', opts, async (request, reply) => {
    const req = request as AuthRequest;
    const body = UploadUrlBody.parse(request.body);
    const key = `${req.workspaceId}/${nanoid(10)}-${body.filename}`;
    const assetId = nanoid(10);

    const command = new PutObjectCommand({
      Bucket: process.env['R2_BUCKET_NAME'],
      Key: key,
      ContentType: body.mimeType,
    });

    const presignedUrl = await getSignedUrl(r2Client(), command, { expiresIn: 300 });
    const publicUrl = `${process.env['R2_PUBLIC_URL']}/${key}`;

    // Create pending asset record
    await db.insert(assets).values({
      id: assetId,
      workspaceId: req.workspaceId,
      url: publicUrl,
      filename: body.filename,
      mimeType: body.mimeType,
    });

    return reply.status(201).send({ assetId, presignedUrl, publicUrl });
  });

  fastify.get('/assets', opts, async (request) => {
    const req = request as AuthRequest;
    return db.select().from(assets).where(eq(assets.workspaceId, req.workspaceId));
  });

  fastify.delete('/assets/:id', opts, async (request, reply) => {
    const req = request as AuthRequest;
    const { id } = request.params as { id: string };

    const [row] = await db
      .delete(assets)
      .where(and(eq(assets.id, id), eq(assets.workspaceId, req.workspaceId)))
      .returning();

    if (!row) return reply.status(404).send({ error: 'Asset not found' });
    return reply.status(204).send();
  });
}
