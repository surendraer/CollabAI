// ============================================================
// controllers/file.controller.ts
// Handles file uploading and list retrieval for a workspace.
// ============================================================
import { Request, Response, NextFunction } from "express";
import File from "../models/file.model";
import FileService from "../services/file.service";
import ActivityLog from "../models/activityLog.model";
import SocketService from "../services/socket.service";
import AppError from "../utils/AppError";
import { HttpStatus } from "../constants";

// ============================================================
// GET /api/workspaces/:workspaceId/files
// Retrieve all files uploaded to a workspace.
// ============================================================
export const getWorkspaceFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = await File.find({ workspaceId: req.workspaceId })
      .populate("uploadedBy", "name avatar")
      .sort({ createdAt: -1 });

    res.status(HttpStatus.OK).json({
      status: "success",
      results: files.length,
      data: { files },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/workspaces/:workspaceId/files
// Upload a file to the workspace. Body: { fileData: string, fileName: string }
// where fileData is a base64 encoded data URI.
// ============================================================
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileData, fileName, taskId } = req.body;

    if (!fileData || !fileName) {
      throw new AppError("fileData (base64 string) and fileName are required", HttpStatus.BAD_REQUEST);
    }

    // Upload using file service (handles Cloudinary vs Mock fallback)
    const uploadResult = await FileService.uploadFile(fileData, fileName);

    const newFile = await File.create({
      workspaceId: req.workspaceId,
      taskId: taskId || undefined,
      uploadedBy: req.user!._id,
      originalName: fileName,
      storageUrl: uploadResult.url,
      storagePublicId: uploadResult.publicId,
      mimeType: uploadResult.mimeType,
      sizeBytes: uploadResult.sizeBytes,
    });

    const populatedFile = await File.findById(newFile._id).populate("uploadedBy", "name avatar");

    // Log this activity
    await ActivityLog.create({
      workspaceId: req.workspaceId!,
      userId: req.user!._id,
      action: "file_uploaded",
      details: `uploaded file "${fileName}"`,
    });

    // Broadcast file upload event
    SocketService.emitToWorkspace(req.workspaceId!, "file:uploaded", { file: populatedFile });

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { file: populatedFile },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/workspaces/:workspaceId/files/:fileId
// Delete a file from the workspace database and storage.
// ============================================================
export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({
      _id: fileId,
      workspaceId: req.workspaceId,
    });

    if (!file) {
      throw new AppError("File not found", HttpStatus.NOT_FOUND);
    }

    // Delete from storage
    await FileService.deleteFile(file.storagePublicId);

    // Delete from DB
    await File.findByIdAndDelete(fileId);

    // Log deletion
    await ActivityLog.create({
      workspaceId: req.workspaceId!,
      userId: req.user!._id,
      action: "file_deleted",
      details: `deleted file "${file.originalName}"`,
    });

    SocketService.emitToWorkspace(req.workspaceId!, "file:deleted", { fileId });

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
