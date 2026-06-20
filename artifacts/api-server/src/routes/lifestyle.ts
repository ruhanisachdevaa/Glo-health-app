import { Router } from "express";
import { db } from "@workspace/db";
import { workoutsTable, nutritionTipsTable, mentalHealthResourcesTable } from "@workspace/db";

const router = Router();

router.get("/lifestyle/workouts", async (req, res) => {
  try {
    const workouts = await db.select().from(workoutsTable);
    return res.json(workouts);
  } catch (err) {
    req.log.error({ err }, "Failed to get workouts");
    return res.status(500).json({ error: "Failed to get workouts" });
  }
});

router.get("/lifestyle/nutrition", async (req, res) => {
  try {
    const tips = await db.select().from(nutritionTipsTable);
    return res.json(tips.map(t => ({ ...t, foods: JSON.parse(t.foods) })));
  } catch (err) {
    req.log.error({ err }, "Failed to get nutrition tips");
    return res.status(500).json({ error: "Failed to get nutrition tips" });
  }
});

router.get("/lifestyle/mental-health", async (req, res) => {
  try {
    const resources = await db.select().from(mentalHealthResourcesTable);
    return res.json(resources.map(r => ({ ...r, tips: JSON.parse(r.tips) })));
  } catch (err) {
    req.log.error({ err }, "Failed to get mental health resources");
    return res.status(500).json({ error: "Failed to get mental health resources" });
  }
});

export default router;
