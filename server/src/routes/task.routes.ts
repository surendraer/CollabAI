import { Router } from "express";
import {
  createTask,
  getProjectTasks,
  getTaskDetails,
  updateTask,
  moveTask,
  deleteTask,
  addComment,
  toggleSubtask,
  getWorkspaceActivity,
} from "../controllers/task.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

// Core CRUD
router.post("/", createTask);
router.get("/project/:projectId", getProjectTasks);
router.get("/:taskId", getTaskDetails);
router.patch("/:taskId", updateTask);
router.patch("/:taskId/move", moveTask);
router.delete("/:taskId", deleteTask);

// Sub-resources
router.post("/:taskId/comments", addComment);
router.patch("/:taskId/subtasks/:subtaskId/toggle", toggleSubtask);

// Activity logs
router.get("/workspace/:workspaceId/activity", getWorkspaceActivity);

export default router;
