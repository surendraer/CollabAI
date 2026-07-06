// ============================================================
// routes/pipeline.routes.ts
// Routes for managing custom Kanban pipeline stages.
// Scoped under /api/workspaces/:workspaceId/pipeline.
// ============================================================
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import workspaceAuthorize from "../middleware/workspaceAuthorize";
import { WorkspaceRoles } from "../constants";
import {
  getPipelineStages,
  createPipelineStage,
  updatePipelineStage,
  reorderPipelineStages,
  deletePipelineStage,
} from "../controllers/pipeline.controller";

// Merge params to access :workspaceId from parent router
const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(workspaceAuthorize());

// Anyone in the workspace can view pipeline stages
router.get("/", getPipelineStages);

// Only Admin/Owner/Manager can modify pipeline layout
const modifierRoles = [WorkspaceRoles.OWNER, WorkspaceRoles.ADMIN, WorkspaceRoles.MANAGER];

router.post("/", workspaceAuthorize(modifierRoles), createPipelineStage);
router.put("/reorder", workspaceAuthorize(modifierRoles), reorderPipelineStages);
router.patch("/:stageId", workspaceAuthorize(modifierRoles), updatePipelineStage);
router.delete("/:stageId", workspaceAuthorize(modifierRoles), deletePipelineStage);

export default router;
