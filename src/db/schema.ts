import { pgTable, text, boolean, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash'),
  email_verified: boolean('email_verified').default(false).notNull(),
  auth_provider: varchar('auth_provider', { enum: ['email', 'google'] }).default('email').notNull(),
  provider_id: text('provider_id'),
  role: varchar('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').notNull(),
  type: varchar('type', { enum: ['email_verification', 'password_reset'] }).notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  key_hash: text('key_hash').notNull().unique(),
  key_prefix: text('key_prefix').notNull(), // To show to user like sk_live_abc123...
  created_at: timestamp('created_at').defaultNow().notNull(),
  last_used_at: timestamp('last_used_at'),
});
