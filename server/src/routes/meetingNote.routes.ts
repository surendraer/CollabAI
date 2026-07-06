// ============================================================
// routes/meetingNote.routes.ts
// Routes for managing collaborative workspace meeting notes.
// Scoped under /api/workspaces/:workspaceId/notes.
// ============================================================
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import workspaceAuthorize from "../middleware/workspaceAuthorize";
import {
  getMeetingNotes,
  getMeetingNoteDetails,
  createMeetingNote,
  updateMeetingNote,
  deleteMeetingNote,
} from "../controllers/meetingNote.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(workspaceAuthorize());

router.get("/", getMeetingNotes);
router.post("/", createMeetingNote);
router.get("/:noteId", getMeetingNoteDetails);
router.patch("/:noteId", updateMeetingNote);
router.delete("/:noteId", deleteMeetingNote);

export default router;
