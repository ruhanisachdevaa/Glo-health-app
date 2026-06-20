import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const zenScoresTable = pgTable("zen_scores", {
  id: serial("id").primaryKey(),
  score: integer("score").notNull(),
  level: integer("level").notNull(),
  timeSeconds: integer("time_seconds").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertZenScoreSchema = createInsertSchema(zenScoresTable).omit({ id: true, createdAt: true });
export type InsertZenScore = z.infer<typeof insertZenScoreSchema>;
export type ZenScore = typeof zenScoresTable.$inferSelect;
