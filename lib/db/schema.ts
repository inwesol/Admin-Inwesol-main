import { pgTable, uuid, varchar, timestamp, boolean, unique, integer, json, jsonb, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User table schema from introspected database
export const users = pgTable('User', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  email: varchar({ length: 64 }).notNull(),
  password: varchar({ length: 64 }),
  name: varchar({ length: 64 }),
  image: varchar({ length: 255 }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  unique('User_email_unique').on(table.email),
]);

// Journey progress table schema
export const journeyProgress = pgTable('journey_progress', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  currentSession: integer('current_session').notNull(),
  completedSessions: json('completed_sessions').notNull(),
  totalScore: integer('total_score').notNull(),
  lastActiveDate: varchar('last_active_date', { length: 32 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  enableByCoach: json('enable_by_coach').default({}),
});

// User session form progress table schema
export const userSessionFormProgress = pgTable('user_session_form_progress', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  sessionId: integer('session_id').notNull(),
  formId: text('form_id').notNull(),
  status: varchar({ length: 32 }).notNull(),
  score: integer(),
  completedAt: varchar('completed_at', { length: 32 }),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  insights: jsonb().default({}),
});

// Coaches table schema
export const coaches = pgTable('coaches', {
  id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  name: text(),
  email: text(),
  clients: text().array(),
  sessionLinks: text('session_links'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  unique('coaches_email_key').on(table.email),
]);
