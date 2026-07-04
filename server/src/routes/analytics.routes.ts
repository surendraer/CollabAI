import { Router } from "express";
import { getWorkspaceAnalytics } from "../controllers/analytics.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/workspace/:workspaceId", getWorkspaceAnalytics);

export default router;
