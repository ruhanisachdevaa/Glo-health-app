import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const symptomsTable = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  name: text("name").notNull(),
  severity: integer("severity").notNull().default(3),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSymptomSchema = createInsertSchema(symptomsTable).omit({ id: true, createdAt: true });
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptomsTable.$inferSelect;
