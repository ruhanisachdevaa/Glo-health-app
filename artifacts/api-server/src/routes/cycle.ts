import { Router } from "express";
import { db } from "@workspace/db";
import { cycleEntriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateCycleEntryBody, UpdateCycleEntryBody, UpdateCycleEntryParams, DeleteCycleEntryParams } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

router.get("/cycle/entries", async (req, res) => {
  try {
    const entries = await db.select().from(cycleEntriesTable).orderBy(desc(cycleEntriesTable.date));
    return res.json(entries);
  } catch (err) {
    req.log.error({ err }, "Failed to get cycle entries");
    return res.status(500).json({ error: "Failed to get cycle entries" });
  }
});

router.post("/cycle/entries", async (req, res) => {
  try {
    const body = CreateCycleEntryBody.parse(req.body);
    const [entry] = await db.insert(cycleEntriesTable).values(body).returning();
    return res.status(201).json(entry);
  } catch (err) {
    req.log.error({ err }, "Failed to create cycle entry");
    return res.status(400).json({ error: "Invalid input" });
  }
});

router.patch("/cycle/entries/:id", async (req, res) => {
  try {
    const { id } = UpdateCycleEntryParams.parse(req.params);
    const body = UpdateCycleEntryBody.parse(req.body);
    const [updated] = await db.update(cycleEntriesTable).set(body).where(eq(cycleEntriesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update cycle entry");
    return res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/cycle/entries/:id", async (req, res) => {
  try {
    const { id } = DeleteCycleEntryParams.parse(req.params);
    await db.delete(cycleEntriesTable).where(eq(cycleEntriesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete cycle entry");
    return res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/cycle/summary", async (req, res) => {
  try {
    const entries = await db.select().from(cycleEntriesTable).orderBy(desc(cycleEntriesTable.date));
    const periodStarts = entries.filter(e => e.type === "period_start");
    
    let avgCycleLength = 28;
    if (periodStarts.length >= 2) {
      const diffs: number[] = [];
      for (let i = 0; i < periodStarts.length - 1; i++) {
        const a = new Date(periodStarts[i].date);
        const b = new Date(periodStarts[i + 1].date);
        diffs.push(Math.abs(Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))));
      }
      avgCycleLength = Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
    }

    const lastPeriodStart = periodStarts[0];
    const today = new Date();
    let cycleDay = 1;
    let nextPeriodDate = new Date(today);
    nextPeriodDate.setDate(today.getDate() + avgCycleLength);

    if (lastPeriodStart) {
      const startDate = new Date(lastPeriodStart.date);
      cycleDay = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      nextPeriodDate = new Date(startDate);
      nextPeriodDate.setDate(startDate.getDate() + avgCycleLength);
    }

    const daysUntilNextPeriod = Math.max(0, Math.round((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const getPhase = (day: number, cycleLen: number) => {
      if (day <= 5) return "menstrual";
      if (day <= 13) return "follicular";
      if (day <= 16) return "ovulation";
      return "luteal";
    };

    const phaseDescriptions: Record<string, string> = {
      menstrual: "Your body is shedding the uterine lining. Rest, nourish, and be gentle with yourself.",
      follicular: "Oestrogen is rising — you'll feel more energetic and creative. A great time to start new things!",
      ovulation: "Peak energy and confidence. You may feel more social and your skin might be glowing.",
      luteal: "Progesterone rises. Focus on self-care, reduce stress, and nourish your body with warming foods.",
    };

    const currentPhase = getPhase(cycleDay, avgCycleLength);
    const ovulationDay = Math.round(avgCycleLength / 2) - 2;
    const fertilityWindow = `Days ${ovulationDay}-${ovulationDay + 5}`;

    return res.json({
      currentPhase,
      cycleDay,
      avgCycleLength,
      nextPeriodDate: nextPeriodDate.toISOString().split("T")[0],
      daysUntilNextPeriod,
      fertilityWindow,
      phaseDescription: phaseDescriptions[currentPhase],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get cycle summary");
    return res.status(500).json({ error: "Failed to get cycle summary" });
  }
});

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [moodRows, symptomRows, cycleRows] = await Promise.all([
      db.select().from(cycleEntriesTable).orderBy(desc(cycleEntriesTable.createdAt)),
      db.select().from(cycleEntriesTable),
      db.select().from(cycleEntriesTable).orderBy(desc(cycleEntriesTable.date)),
    ]);

    const { moodsTable, symptomsTable, zenScoresTable } = await import("@workspace/db");
    const [moods, symptoms, zenScores] = await Promise.all([
      db.select().from(moodsTable).orderBy(desc(moodsTable.date)).limit(30),
      db.select().from(symptomsTable).orderBy(desc(symptomsTable.date)).limit(30),
      db.select().from(zenScoresTable),
    ]);

    const moodCounts: Record<string, number> = {};
    moods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "calm";

    const totalPoints = zenScores.reduce((sum, s) => sum + (s.pointsEarned ?? 0), 0);

    const periodStarts = cycleRows.filter(e => e.type === "period_start");
    let avgCycleLength = 28;
    if (periodStarts.length >= 2) {
      const diffs: number[] = [];
      for (let i = 0; i < periodStarts.length - 1; i++) {
        const a = new Date(periodStarts[i].date);
        const b = new Date(periodStarts[i + 1].date);
        diffs.push(Math.abs(Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))));
      }
      avgCycleLength = Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
    }

    return res.json({
      loggingStreak: moods.length > 0 ? Math.min(moods.length, 7) : 0,
      avgCycleLength,
      symptomsThisMonth: symptoms.length,
      dominantMood,
      totalPoints,
      cycleCount: periodStarts.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    return res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

export default router;
