import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { SendChatMessageBody } from "@workspace/api-zod";

const MYTH_RESPONSES = [
  "Actually, that's a myth! You can absolutely swim during your period — modern menstrual products are designed for this. Your flow doesn't increase in water.",
  "Myth busted! Period blood is not 'dirty' — it's simply uterine lining mixed with blood and mucus. It's a completely natural process.",
  "That's not quite right! Chocolate cravings during your period are real — your body craves magnesium, which dark chocolate contains. A little treat is perfectly fine!",
  "Actually, mild exercise during your period can help reduce cramps by releasing endorphins. You don't need to rest completely — listen to your body!",
  "Myth! Periods don't sync between people who spend time together. Studies haven't found consistent evidence for menstrual synchrony.",
  "Not true! You can get pregnant during your period, especially if you have a short cycle. Sperm can survive up to 5 days.",
  "Myth busted! PMS is very real and recognised medically. Mood changes before your period are caused by hormonal fluctuations — not emotions.",
  "Actually, using a menstrual cup or tampon does not affect your virginity. The hymen is a flexible membrane and varies widely between individuals.",
  "That's a misconception! PMDD (Premenstrual Dysphoric Disorder) is a serious medical condition affecting up to 8% of people with periods. It's not 'just PMS'.",
  "Myth! Period pain is not something you simply have to put up with. Severe cramps may indicate conditions like endometriosis and deserve medical attention.",
];

const router = Router();

router.get("/chat/messages", async (req, res) => {
  try {
    const messages = await db.select().from(chatMessagesTable).orderBy(chatMessagesTable.createdAt).limit(100);
    return res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to get chat messages");
    return res.status(500).json({ error: "Failed to get chat messages" });
  }
});

router.post("/chat/messages", async (req, res) => {
  try {
    const body = SendChatMessageBody.parse(req.body);
    
    // Save user message
    const [userMessage] = await db.insert(chatMessagesTable).values({
      role: "user",
      content: body.content,
      language: body.language ?? "en",
    }).returning();

    // Generate bot response
    const count = await db.select().from(chatMessagesTable);
    const responseText = MYTH_RESPONSES[count.length % MYTH_RESPONSES.length];
    
    const [botMessage] = await db.insert(chatMessagesTable).values({
      role: "assistant",
      content: responseText,
      language: body.language ?? "en",
    }).returning();

    return res.status(201).json(botMessage);
  } catch (err) {
    req.log.error({ err }, "Failed to send chat message");
    return res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
