import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const affirmationsTable = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type").notNull(), // affirmation, fact, joke
  phase: text("phase").notNull(), // menstrual, follicular, ovulation, luteal, all
  emoji: text("emoji").notNull().default("✨"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffirmationSchema = createInsertSchema(affirmationsTable).omit({ id: true, createdAt: true });
export type InsertAffirmation = z.infer<typeof insertAffirmationSchema>;
export type Affirmation = typeof affirmationsTable.$inferSelect;
