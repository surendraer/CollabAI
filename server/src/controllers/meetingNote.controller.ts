// ============================================================
// controllers/meetingNote.controller.ts
// Handles collaborative meeting notes / lab journals per workspace.
// ============================================================
import { Request, Response, NextFunction } from "express";
import MeetingNote from "../models/meetingNote.model";
import ActivityLog from "../models/activityLog.model";
import SocketService from "../services/socket.service";
import AppError from "../utils/AppError";
import { HttpStatus } from "../constants";

// ============================================================
// GET /api/workspaces/:workspaceId/notes
// List titles and metadata of all meeting notes in a workspace.
// ============================================================
export const getMeetingNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notes = await MeetingNote.find({ workspaceId: req.workspaceId })
      .populate("lastEditedBy", "name avatar")
      .sort({ updatedAt: -1 })
      .select("-content"); // don't return large markdown content in list view

    res.status(HttpStatus.OK).json({
      status: "success",
      results: notes.length,
      data: { notes },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/workspaces/:workspaceId/notes/:noteId
// Retrieve full note details including markdown content.
// ============================================================
export const getMeetingNoteDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { noteId } = req.params;

    const note = await MeetingNote.findOne({
      _id: noteId,
      workspaceId: req.workspaceId,
    }).populate("lastEditedBy", "name avatar");

    if (!note) {
      throw new AppError("Meeting note not found", HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/workspaces/:workspaceId/notes
// Create a new meeting note.
// ============================================================
export const createMeetingNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content } = req.body;

    if (!title) {
      throw new AppError("Meeting note title is required", HttpStatus.BAD_REQUEST);
    }

    const note = await MeetingNote.create({
      workspaceId: req.workspaceId,
      title,
      content: content || "",
      lastEditedBy: req.user!._id,
    });

    const populated = await MeetingNote.findById(note._id).populate("lastEditedBy", "name avatar");

    // Log action
    await ActivityLog.create({
      workspaceId: req.workspaceId!,
      userId: req.user!._id,
      action: "note_created",
      details: `created meeting note "${title}"`,
    });

    SocketService.emitToWorkspace(req.workspaceId!, "note:created", { note: populated });

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { note: populated },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATCH /api/workspaces/:workspaceId/notes/:noteId
// Update note title or content (saves markdown text).
// ============================================================
export const updateMeetingNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    const note = await MeetingNote.findOne({
      _id: noteId,
      workspaceId: req.workspaceId,
    });

    if (!note) {
      throw new AppError("Meeting note not found", HttpStatus.NOT_FOUND);
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    note.lastEditedBy = req.user!._id;

    await note.save();

    const populated = await MeetingNote.findById(note._id).populate("lastEditedBy", "name avatar");

    // Real-time synchronization event so other users see changes live
    SocketService.emitToWorkspace(req.workspaceId!, "note:updated", { note: populated });

    res.status(HttpStatus.OK).json({
      status: "success",
      data: { note: populated },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/workspaces/:workspaceId/notes/:noteId
// Delete a meeting note.
// ============================================================
export const deleteMeetingNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { noteId } = req.params;

    const note = await MeetingNote.findOne({
      _id: noteId,
      workspaceId: req.workspaceId,
    });

    if (!note) {
      throw new AppError("Meeting note not found", HttpStatus.NOT_FOUND);
    }

    await MeetingNote.findByIdAndDelete(noteId);

    // Log deletion
    await ActivityLog.create({
      workspaceId: req.workspaceId!,
      userId: req.user!._id,
      action: "note_deleted",
      details: `deleted meeting note "${note.title}"`,
    });

    SocketService.emitToWorkspace(req.workspaceId!, "note:deleted", { noteId });

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
