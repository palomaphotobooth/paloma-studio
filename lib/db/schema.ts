import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const channelStatusEnum = pgEnum("channel_status", ["active", "paused"]);
export const videoStatusEnum = pgEnum("video_status", ["draft", "queued", "processing", "complete", "failed"]);
export const generationStepEnum = pgEnum("generation_step", ["queued", "scripting", "captions", "assembling", "complete"]);

export const channels = pgTable("channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  status: channelStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const series = pgTable("series", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  channelId: uuid("channel_id").notNull().references(() => channels.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  seriesId: uuid("series_id").notNull().references(() => series.id),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  scriptText: text("script_text").notNull(),
  captionText: text("caption_text").notNull(),
  status: videoStatusEnum("status").default("draft").notNull(),
  generationStep: generationStepEnum("generation_step").default("queued").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const generationJobs = pgTable("generation_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoId: uuid("video_id").notNull().references(() => videos.id),
  userId: text("user_id").notNull(),
  status: generationStepEnum("status").default("queued").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
