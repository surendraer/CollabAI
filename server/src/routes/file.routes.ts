// ============================================================
// routes/file.routes.ts
// Routes for uploading, retrieving, and deleting workspace files.
// Scoped under /api/workspaces/:workspaceId/files.
// ============================================================
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import workspaceAuthorize from "../middleware/workspaceAuthorize";
import { getWorkspaceFiles, uploadFile, deleteFile } from "../controllers/file.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(workspaceAuthorize());

router.get("/", getWorkspaceFiles);
router.post("/", uploadFile);
router.delete("/:fileId", deleteFile);

export default router;
