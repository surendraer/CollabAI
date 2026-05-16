import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "CollabAI API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
