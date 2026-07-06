import { Router } from "express";
import authRoutes from "./auth.routes";
import labRoutes from "./lab.routes";
import workspaceRoutes from "./workspace.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";
import chatRoutes from "./chat.routes";
import dmRoutes from "./dm.routes";
import notificationRoutes from "./notification.routes";
import aiRoutes from "./ai.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/labs", labRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/chat", chatRoutes);
router.use("/messages/dm", dmRoutes);
router.use("/notifications", notificationRoutes);
router.use("/ai", aiRoutes);
router.use("/analytics", analyticsRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "CollabAI API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
