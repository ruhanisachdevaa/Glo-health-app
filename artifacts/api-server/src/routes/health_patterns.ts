import { Router } from "express";
import { db } from "@workspace/db";
import { weightEntriesTable, moodsTable, symptomsTable, cycleEntriesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { LogWeightBody } from "@workspace/api-zod";

const router = Router();

router.get("/health/weight", async (req, res) => {
  try {
    const entries = await db.select().from(weightEntriesTable).orderBy(desc(weightEntriesTable.date)).limit(90);
    return res.json(entries.map(e => ({ ...e, weightKg: parseFloat(e.weightKg) })));
  } catch (err) {
    req.log.error({ err }, "Failed to get weight entries");
    return res.status(500).json({ error: "Failed to get weight entries" });
  }
});

router.post("/health/weight", async (req, res) => {
  try {
    const body = LogWeightBody.parse(req.body);
    const [entry] = await db.insert(weightEntriesTable).values(body).returning();
    return res.status(201).json({ ...entry, weightKg: parseFloat(entry.weightKg) });
  } catch (err) {
    req.log.error({ err }, "Failed to log weight");
    return res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/health/correlations", async (req, res) => {
  try {
    const [moods, symptoms, cycleEntries] = await Promise.all([
      db.select().from(moodsTable).orderBy(desc(moodsTable.date)).limit(60),
      db.select().from(symptomsTable).orderBy(desc(symptomsTable.date)).limit(60),
      db.select().from(cycleEntriesTable).orderBy(desc(cycleEntriesTable.date)).limit(60),
    ]);

    const insights = [];

    // Rule 1: mood dip in luteal phase
    const lutealPhaseStart = cycleEntries.find(e => e.type === "period_start");
    if (lutealPhaseStart && moods.length > 5) {
      const lowMoods = moods.filter(m => m.mood === "anxious" || m.mood === "irritable" || m.mood === "sad");
      if (lowMoods.length > moods.length * 0.3) {
        insights.push({
          id: "mood-luteal",
          title: "Mood Dips in Late Luteal Phase",
          description: `Your mood tends to dip (${Math.round(lowMoods.length / moods.length * 100)}% of logged days show anxious, irritable, or low mood) — this aligns with your late luteal phase when progesterone drops. This is very common and may indicate PMS or PMDD patterns.`,
          confidence: "high",
          category: "mood",
        });
      }
    }

    // Rule 2: fatigue correlation
    const fatigue = symptoms.filter(s => s.name.toLowerCase().includes("fatigue") || s.name.toLowerCase().includes("tired"));
    const tieredMoods = moods.filter(m => m.mood === "tired" || m.energy < 5);
    if (fatigue.length > 2 || tieredMoods.length > 3) {
      insights.push({
        id: "fatigue-energy",
        title: "Fatigue Patterns Detected",
        description: `You've logged fatigue or low energy ${fatigue.length + tieredMoods.length} times recently. Low energy tends to peak during your menstrual and late luteal phases — try iron-rich foods and gentle movement on these days.`,
        confidence: fatigue.length + tieredMoods.length > 5 ? "high" : "medium",
        category: "energy",
      });
    }

    // Rule 3: cramp severity
    const cramps = symptoms.filter(s => s.name.toLowerCase().includes("cramp"));
    if (cramps.length > 0) {
      const avgSeverity = cramps.reduce((s, c) => s + c.severity, 0) / cramps.length;
      insights.push({
        id: "cramp-severity",
        title: `Average Cramp Severity: ${avgSeverity.toFixed(1)}/10`,
        description: avgSeverity > 6
          ? "Your cramps are consistently rated as moderate-to-severe. This may warrant a GP visit to rule out conditions like endometriosis or PCOS."
          : "Your cramps are manageable. Heat therapy and magnesium supplementation may help reduce them further.",
        confidence: cramps.length > 3 ? "high" : "medium",
        category: "pain",
      });
    }

    // Rule 4: mood-energy correlation
    const highEnergy = moods.filter(m => m.energy >= 7);
    const positiveOnHighEnergy = highEnergy.filter(m => m.mood === "happy" || m.mood === "energised" || m.mood === "calm");
    if (highEnergy.length > 3) {
      const correlation = Math.round(positiveOnHighEnergy.length / highEnergy.length * 100);
      insights.push({
        id: "energy-mood",
        title: "Energy Strongly Predicts Your Mood",
        description: `On days when your energy is 7/10 or higher, ${correlation}% of the time you report positive moods (happy, energised, calm). Prioritising sleep and nutrition on high-demand days can help maintain this.`,
        confidence: "medium",
        category: "mood",
      });
    }

    // Rule 5: symptom load
    if (symptoms.length > 10) {
      const byPhase: Record<string, number> = { menstrual: 0, follicular: 0, ovulation: 0, luteal: 0 };
      // Simple bucketing by date relative to period start
      if (lutealPhaseStart) {
        const start = new Date(lutealPhaseStart.date);
        symptoms.forEach(s => {
          const sDate = new Date(s.date);
          const dayInCycle = Math.round((sDate.getTime() - start.getTime()) / 86400000);
          if (dayInCycle >= 0 && dayInCycle <= 5) byPhase.menstrual++;
          else if (dayInCycle <= 13) byPhase.follicular++;
          else if (dayInCycle <= 16) byPhase.ovulation++;
          else byPhase.luteal++;
        });
        const peakPhase = Object.entries(byPhase).sort((a, b) => b[1] - a[1])[0];
        if (peakPhase[1] > 0) {
          insights.push({
            id: "symptom-phase",
            title: `Most Symptoms in ${peakPhase[0].charAt(0).toUpperCase() + peakPhase[0].slice(1)} Phase`,
            description: `You log the most physical symptoms during your ${peakPhase[0]} phase (${peakPhase[1]} logged). This is your most vulnerable window — plan lighter workloads and self-care on these days.`,
            confidence: "medium",
            category: "general",
          });
        }
      }
    }

    // Default insight if none
    if (insights.length === 0) {
      insights.push({
        id: "keep-logging",
        title: "Keep Logging for Insights",
        description: "Log your mood, symptoms, and cycle data for at least 2 weeks to unlock personalised correlation insights. The more you track, the smarter your insights become.",
        confidence: "low",
        category: "general",
      });
    }

    return res.json(insights);
  } catch (err) {
    req.log.error({ err }, "Failed to get correlations");
    return res.status(500).json({ error: "Failed to get correlations" });
  }
});

export default router;
