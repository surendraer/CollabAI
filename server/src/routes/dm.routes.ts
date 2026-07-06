// ============================================================
// routes/dm.routes.ts
// Routes for direct messaging (DMs) between collaborators.
// ============================================================
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { getDirectMessages, sendDirectMessage } from "../controllers/dm.controller";

const router = Router();

router.use(authenticate);

router.get("/:recipientId", getDirectMessages);
router.post("/:recipientId", sendDirectMessage);

export default router;
