import { Router } from "express";
import { db } from "@workspace/db";
import { zenScoresTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { SaveZenScoreBody } from "@workspace/api-zod";

const router = Router();

router.get("/zenzone/scores", async (req, res) => {
  try {
    const scores = await db.select().from(zenScoresTable).orderBy(desc(zenScoresTable.score)).limit(20);
    return res.json(scores);
  } catch (err) {
    req.log.error({ err }, "Failed to get zen scores");
    return res.status(500).json({ error: "Failed to get zen scores" });
  }
});

router.post("/zenzone/scores", async (req, res) => {
  try {
    const body = SaveZenScoreBody.parse(req.body);
    const pointsEarned = Math.round((body.score / Math.max(body.timeSeconds, 1)) * 100 * body.level);
    const [score] = await db.insert(zenScoresTable).values({ ...body, pointsEarned }).returning();
    return res.status(201).json(score);
  } catch (err) {
    req.log.error({ err }, "Failed to save zen score");
    return res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
