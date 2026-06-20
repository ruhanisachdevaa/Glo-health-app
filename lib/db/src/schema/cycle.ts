import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cycleEntriesTable = pgTable("cycle_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  type: text("type").notNull(), // period_start, period_end, ovulation, fertile_window, spotting
  flow: text("flow"), // light, medium, heavy
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCycleEntrySchema = createInsertSchema(cycleEntriesTable).omit({ id: true, createdAt: true });
export type InsertCycleEntry = z.infer<typeof insertCycleEntrySchema>;
export type CycleEntry = typeof cycleEntriesTable.$inferSelect;
