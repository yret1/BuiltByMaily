import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const workspaces = pgTable('workspaces', {
  id:                   text('id').primaryKey(),
  name:                 text('name').notNull(),
  plan:                 text('plan').notNull().default('free'),
  stripeCustomerId:     text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt:            timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id:           text('id').primaryKey(),
  workspaceId:  text('workspace_id').references(() => workspaces.id),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role:         text('role').notNull().default('editor'),
  createdAt:    timestamp('created_at').defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id:          text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id),
  keyHash:     text('key_hash').notNull(),
  keyPrefix:   text('key_prefix').notNull(),
  label:       text('label'),
  lastUsedAt:  timestamp('last_used_at'),
  createdAt:   timestamp('created_at').defaultNow(),
  revokedAt:   timestamp('revoked_at'),
});

export const templates = pgTable('templates', {
  id:           text('id').primaryKey(),
  workspaceId:  text('workspace_id').references(() => workspaces.id),
  name:         text('name').notNull(),
  schema:       jsonb('schema').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  tags:         text('tags').array(),
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
});

export const assets = pgTable('assets', {
  id:          text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id),
  url:         text('url').notNull(),
  filename:    text('filename').notNull(),
  mimeType:    text('mime_type').notNull(),
  sizeBytes:   text('size_bytes'),
  createdAt:   timestamp('created_at').defaultNow(),
});
