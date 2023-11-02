import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  doublePrecision,
  unique,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const pgTable = pgTableCreator((name) => `devs_${name}`);

// ! Users
export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  projects: many(projects),
  inspirations: many(inspirations),
  ratings: many(ratings),
  comments: many(comments),
  suggestedFeatures: many(features),
}));

// ! Accounts
export const accounts = pgTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// ! Sessions
export const sessions = pgTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ! Verification
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    unq_tkn: unique().on(vt.identifier, vt.token),
  }),
);

// ! Projects
export const projects = pgTable("project", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  userId: varchar("userId").notNull(),
  description: text("description"),
  source_code_url: varchar("source_code_url").notNull(),
  live_demo_url: varchar("live_demo_url"),
  image: varchar("image", { length: 255 }),
  average_rating: doublePrecision("average_rating"),
  inspiredId: varchar("inspiredId", { length: 255 }),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  inspired: one(inspirations, {
    fields: [projects.inspiredId],
    references: [inspirations.id],
  }),
  ratings: many(ratings),
  hashtags: many(hashtags),
  comments: many(comments),
}));

// ! Inspirations
export const inspirations = pgTable("inspiration", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow(),

  userId: varchar("userId").notNull(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
});

export const inspirationsRelations = relations(
  inspirations,
  ({ many, one }) => ({
    implemented: many(projects),
    user: one(users, { fields: [inspirations.userId], references: [users.id] }),
    suggestedFeatures: many(features),
  }),
);

// ! Features
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  shortDescription: varchar("shortDescription", { length: 160 }),

  userId: varchar("userId", { length: 255 }).notNull(),
  inspirationId: varchar("inspiredId", { length: 255 }),
});

export const featuresRelations = relations(features, ({ one }) => ({
  inspiration: one(inspirations, {
    fields: [features.inspirationId],
    references: [inspirations.id],
  }),
  user: one(users, { fields: [features.userId], references: [users.id] }),
}));

// ! Ratings
export const ratings = pgTable(
  "rating",
  {
    id: serial("id").primaryKey(),
    value: integer("value").default(0),

    projectId: varchar("projectId", { length: 255 }),
    userId: varchar("projectId", { length: 255 }),
  },
  (r) => ({
    unq: unique().on(r.id, r.userId),
  }),
);

export const ratingsRelations = relations(ratings, ({ one }) => ({
  project: one(projects, {
    fields: [ratings.projectId],
    references: [projects.id],
  }),
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
}));

// ! Hashtags
export const hashtags = pgTable("hashtag", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique(),
});

export const hashtagsRelations = relations(hashtags, ({ many }) => ({
  projects: many(projects),
}));

// ! Comments
export const comments = pgTable("comment", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
  body: text("body").notNull(),
  userId: varchar("userId", { length: 255 }),
  projectId: varchar("projectId", { length: 255 }),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
}));
