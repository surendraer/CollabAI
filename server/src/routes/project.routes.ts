import { Router } from "express";
import {
  createProject,
  getWorkspaceProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.post("/", createProject);
router.get("/workspace/:workspaceId", getWorkspaceProjects);
router.get("/:projectId", getProjectDetails);
router.patch("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

export default router;
