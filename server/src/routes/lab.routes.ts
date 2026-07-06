// ============================================================
// routes/lab.routes.ts
// All routes for lab management, member operations, and listing
// workspaces under a lab.
// ============================================================
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import {
  getMyLabs,
  createLab,
  getLabDetails,
  updateLab,
  archiveLab,
  getLabMembers,
  inviteToLab,
  acceptLabInvite,
  updateLabMemberRole,
  removeLabMember,
  getLabWorkspaces,
} from "../controllers/lab.controller";
import { labOwnerOnly, labManagerOrAbove } from "../middleware/labAuthorize";

const router = Router();

// All lab routes require authentication
router.use(authenticate);

// ===== Lab CRUD =====
router.get("/", getMyLabs);
router.post("/", createLab);
router.get("/:labId", getLabDetails);
router.patch("/:labId", labOwnerOnly, updateLab);
router.delete("/:labId", labOwnerOnly, archiveLab);

// ===== Lab Workspaces =====
router.get("/:labId/workspaces", getLabWorkspaces);

// ===== Lab Members =====
router.get("/:labId/members", getLabMembers);
router.post("/:labId/invite", labManagerOrAbove, inviteToLab);
router.patch("/:labId/members/:userId/role", labOwnerOnly, updateLabMemberRole);
router.delete("/:labId/members/:userId", removeLabMember);

// ===== Accept Invite (no lab auth needed — the user isn't a member yet) =====
router.post("/accept-invite/:token", acceptLabInvite);

export default router;
