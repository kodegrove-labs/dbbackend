import { pgTable, text, boolean, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  avatar_url: text('avatar_url'),
  stripe_customer_id: text('stripe_customer_id'),
  metadata: jsonb('metadata'),
  password_hash: text('password_hash'),
  email_verified: boolean('email_verified').default(false).notNull(),
  auth_provider: varchar('auth_provider', { enum: ['email', 'google'] }).default('email').notNull(),
  provider_id: text('provider_id'),
  role: varchar('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  last_sign_in_at: timestamp('last_sign_in_at'),
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

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  used_at: timestamp('used_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const emailMessages = pgTable('email_messages', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  to_email: text('to_email').notNull(),
  template: text('template').notNull(),
  status: varchar('status', { enum: ['pending', 'sent', 'failed'] }).default('pending').notNull(),
  provider_message_id: text('provider_message_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  sent_at: timestamp('sent_at'),
});

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  key_hash: text('key_hash').notNull().unique(),
  key_prefix: text('key_prefix').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  last_used_at: timestamp('last_used_at'),
});
