import { Router } from "express";
import { db } from "@workspace/db";
import { moodsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { LogMoodBody } from "@workspace/api-zod";

const router = Router();

router.get("/moods", async (req, res) => {
  try {
    const moods = await db.select().from(moodsTable).orderBy(desc(moodsTable.date));
    return res.json(moods);
  } catch (err) {
    req.log.error({ err }, "Failed to get moods");
    return res.status(500).json({ error: "Failed to get moods" });
  }
});

router.post("/moods", async (req, res) => {
  try {
    const body = LogMoodBody.parse(req.body);
    const [mood] = await db.insert(moodsTable).values(body).returning();
    return res.status(201).json(mood);
  } catch (err) {
    req.log.error({ err }, "Failed to log mood");
    return res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
