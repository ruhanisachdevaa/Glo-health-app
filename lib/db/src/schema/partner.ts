import { pgTable, serial, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnerSyncTable = pgTable("partner_sync", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  sharePhase: boolean("share_phase").notNull().default(true),
  shareSymptoms: boolean("share_symptoms").notNull().default(false),
  shareMood: boolean("share_mood").notNull().default(false),
  partnerEmail: text("partner_email"),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPartnerSyncSchema = createInsertSchema(partnerSyncTable).omit({ id: true, createdAt: true });
export type InsertPartnerSync = z.infer<typeof insertPartnerSyncSchema>;
export type PartnerSync = typeof partnerSyncTable.$inferSelect;
