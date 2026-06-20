import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const questionnaireResponsesTable = pgTable("questionnaire_responses", {
  id: serial("id").primaryKey(),
  questionId: text("question_id").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuestionnaireResponseSchema = createInsertSchema(questionnaireResponsesTable).omit({ id: true, createdAt: true });
export type InsertQuestionnaireResponse = z.infer<typeof insertQuestionnaireResponseSchema>;
export type QuestionnaireResponse = typeof questionnaireResponsesTable.$inferSelect;
