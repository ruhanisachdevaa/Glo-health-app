import { Router } from "express";
import { db } from "@workspace/db";
import { partnerSyncTable } from "@workspace/db";
import { UpdatePartnerSyncBody } from "@workspace/api-zod";

const router = Router();

router.get("/partner/sync", async (req, res) => {
  try {
    const rows = await db.select().from(partnerSyncTable);
    if (!rows.length) {
      const [created] = await db.insert(partnerSyncTable).values({
        enabled: false,
        sharePhase: true,
        shareSymptoms: false,
        shareMood: false,
        partnerEmail: null,
      }).returning();
      return res.json(created);
    }
    return res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to get partner sync");
    return res.status(500).json({ error: "Failed to get partner sync" });
  }
});

router.post("/partner/sync", async (req, res) => {
  try {
    const body = UpdatePartnerSyncBody.parse(req.body);
    const existing = await db.select().from(partnerSyncTable);
    
    if (existing.length) {
      const { eq } = await import("drizzle-orm");
      const [updated] = await db.update(partnerSyncTable).set({
        ...body,
        lastSynced: body.enabled ? new Date() : existing[0].lastSynced,
      }).where(eq(partnerSyncTable.id, existing[0].id)).returning();
      return res.json(updated);
    } else {
      const [created] = await db.insert(partnerSyncTable).values({ ...body }).returning();
      return res.json(created);
    }
  } catch (err) {
    req.log.error({ err }, "Failed to update partner sync");
    return res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
