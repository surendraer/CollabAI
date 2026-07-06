import { Router } from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  updateWorkspace,
  deleteWorkspace,
  inviteUser,
  acceptInvite,
  getWorkspaceInvitations,
  revokeInvitation,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
} from "../controllers/workspace.controller";
import authenticate from "../middleware/authenticate";
import workspaceAuthorize from "../middleware/workspaceAuthorize";
import { WorkspaceRoles } from "../constants";
import pipelineRoutes from "./pipeline.routes";
import fileRoutes from "./file.routes";
import meetingNoteRoutes from "./meetingNote.routes";

const router = Router();

// Public / Authenticated endpoints
router.post("/", authenticate, createWorkspace);
router.get("/", authenticate, getWorkspaces);
router.post("/join/:token", authenticate, acceptInvite);

// Workspace specific endpoints (requires membership check)
router.get("/:workspaceId", authenticate, workspaceAuthorize(), getWorkspaceDetails);
router.patch(
  "/:workspaceId",
  authenticate,
  workspaceAuthorize([WorkspaceRoles.OWNER, WorkspaceRoles.ADMIN]),
  updateWorkspace
);
router.delete("/:workspaceId", authenticate, workspaceAuthorize([WorkspaceRoles.OWNER]), deleteWorkspace);

// Invitations and members
router.post(
  "/:workspaceId/invite",
  authenticate,
  workspaceAuthorize([WorkspaceRoles.OWNER, WorkspaceRoles.ADMIN]),
  inviteUser
);
router.get(
  "/:workspaceId/invitations",
  authenticate,
  workspaceAuthorize([WorkspaceRoles.OWNER, WorkspaceRoles.ADMIN]),
  getWorkspaceInvitations
);
router.delete(
  "/:workspaceId/invitations/:invitationId",
  authenticate,
  workspaceAuthorize([WorkspaceRoles.OWNER, WorkspaceRoles.ADMIN]),
  revokeInvitation
);
router.get("/:workspaceId/members", authenticate, workspaceAuthorize(), getWorkspaceMembers);
router.patch(
  "/:workspaceId/members/:userId",
  authenticate,
  workspaceAuthorize([WorkspaceRoles.OWNER, WorkspaceRoles.ADMIN]),
  updateMemberRole
);
router.delete("/:workspaceId/members/:userId", authenticate, workspaceAuthorize(), removeMember);

// Nest pipeline, file management, and meeting notes
router.use("/:workspaceId/pipeline", pipelineRoutes);
router.use("/:workspaceId/files", fileRoutes);
router.use("/:workspaceId/notes", meetingNoteRoutes);

export default router;
