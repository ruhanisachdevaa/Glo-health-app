import { Router } from "express";
import { db } from "@workspace/db";
import { questionnaireResponsesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { SaveQuestionnaireResponseBody } from "@workspace/api-zod";

const router = Router();

router.get("/questionnaire/responses", async (req, res) => {
  try {
    const responses = await db.select().from(questionnaireResponsesTable).orderBy(desc(questionnaireResponsesTable.createdAt));
    return res.json(responses);
  } catch (err) {
    req.log.error({ err }, "Failed to get questionnaire responses");
    return res.status(500).json({ error: "Failed to get questionnaire responses" });
  }
});

router.post("/questionnaire/responses", async (req, res) => {
  try {
    const body = SaveQuestionnaireResponseBody.parse(req.body);
    const [response] = await db.insert(questionnaireResponsesTable).values(body).returning();
    return res.status(201).json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to save questionnaire response");
    return res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
