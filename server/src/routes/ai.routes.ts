import { Router } from "express";
import { getTaskBreakdown, getSprintSummary, analyzeError, parseNotes, getLiteratureReview } from "../controllers/ai.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.post("/task-breakdown", getTaskBreakdown);
router.post("/sprint-summary", getSprintSummary);
router.post("/analyze-error", analyzeError);
router.post("/meeting-notes", parseNotes);
router.post("/literature-review", getLiteratureReview);

export default router;
