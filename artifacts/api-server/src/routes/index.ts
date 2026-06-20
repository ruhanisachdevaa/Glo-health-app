import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cycleRouter from "./cycle";
import symptomsRouter from "./symptoms";
import moodsRouter from "./moods";
import marketplaceRouter from "./marketplace";
import lifestyleRouter from "./lifestyle";
import zenzoneRouter from "./zenzone";
import affirmationsRouter from "./affirmations";
import chatRouter from "./chat";
import questionnaireRouter from "./questionnaire";
import partnerRouter from "./partner";
import healthPatternsRouter from "./health_patterns";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cycleRouter);
router.use(symptomsRouter);
router.use(moodsRouter);
router.use(marketplaceRouter);
router.use(lifestyleRouter);
router.use(zenzoneRouter);
router.use(affirmationsRouter);
router.use(chatRouter);
router.use(questionnaireRouter);
router.use(partnerRouter);
router.use(healthPatternsRouter);

export default router;
