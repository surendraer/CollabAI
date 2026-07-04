import { Router } from "express";
import { getWorkspaceMessages, sendMessage } from "../controllers/chat.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/workspace/:workspaceId", getWorkspaceMessages);
router.post("/workspace/:workspaceId", sendMessage);

export default router;
