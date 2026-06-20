import { Router } from "express";
import { db } from "@workspace/db";
import { symptomsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { LogSymptomBody } from "@workspace/api-zod";

const router = Router();

router.get("/symptoms", async (req, res) => {
  try {
    const symptoms = await db.select().from(symptomsTable).orderBy(desc(symptomsTable.date));
    return res.json(symptoms);
  } catch (err) {
    req.log.error({ err }, "Failed to get symptoms");
    return res.status(500).json({ error: "Failed to get symptoms" });
  }
});

router.post("/symptoms", async (req, res) => {
  try {
    const body = LogSymptomBody.parse(req.body);
    const [symptom] = await db.insert(symptomsTable).values(body).returning();
    return res.status(201).json(symptom);
  } catch (err) {
    req.log.error({ err }, "Failed to log symptom");
    return res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
