import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workoutsTable = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  phase: text("phase").notNull(),
  duration: integer("duration").notNull(),
  intensity: text("intensity").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionTipsTable = pgTable("nutrition_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  phase: text("phase").notNull(),
  foods: text("foods").notNull(), // JSON array as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mentalHealthResourcesTable = pgTable("mental_health_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  readTime: integer("read_time").notNull().default(3),
  tips: text("tips").notNull(), // JSON array as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkoutSchema = createInsertSchema(workoutsTable).omit({ id: true, createdAt: true });
export const insertNutritionTipSchema = createInsertSchema(nutritionTipsTable).omit({ id: true, createdAt: true });
export const insertMentalHealthResourceSchema = createInsertSchema(mentalHealthResourcesTable).omit({ id: true, createdAt: true });

export type Workout = typeof workoutsTable.$inferSelect;
export type NutritionTip = typeof nutritionTipsTable.$inferSelect;
export type MentalHealthResource = typeof mentalHealthResourcesTable.$inferSelect;
