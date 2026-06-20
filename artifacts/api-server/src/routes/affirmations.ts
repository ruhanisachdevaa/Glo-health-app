import { Router } from "express";
import { db } from "@workspace/db";
import { affirmationsTable } from "@workspace/db";

const router = Router();

router.get("/affirmations/daily", async (req, res) => {
  try {
    const all = await db.select().from(affirmationsTable);
    if (!all.length) {
      return res.json({ id: 1, text: "You are doing amazingly well.", type: "affirmation", phase: "all", emoji: "✨" });
    }
    // Rotate by day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const affirmation = all[dayOfYear % all.length];
    return res.json(affirmation);
  } catch (err) {
    req.log.error({ err }, "Failed to get affirmation");
    return res.status(500).json({ error: "Failed to get affirmation" });
  }
});

export default router;
