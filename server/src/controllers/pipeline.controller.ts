// ============================================================
// controllers/pipeline.controller.ts
// Manages custom pipeline stages (Kanban columns) for a workspace.
// Owners and Lab Assistants can create, rename, recolor, reorder,
// and delete stages. All members can view stages.
// ============================================================
import { Request, Response, NextFunction } from "express";
import PipelineStage from "../models/pipelineStage.model";
import Task from "../models/task.model";
import Member from "../models/member.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages, WorkspaceRoles } from "../constants";
import SocketService from "../services/socket.service";

// ============================================================
// GET /api/workspaces/:workspaceId/pipeline
// Fetch all pipeline stages for a workspace, ordered by position.
// ============================================================
export const getPipelineStages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stages = await PipelineStage.find({ workspaceId: req.workspaceId })
      .sort({ order: 1 });

    res.status(HttpStatus.OK).json({
      status: "success",
      results: stages.length,
      data: { stages },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/workspaces/:workspaceId/pipeline
// Create a new pipeline stage. Owner / Lab Assistant only.
// ============================================================
export const createPipelineStage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, color } = req.body;

    if (!name) {
      throw new AppError("Stage name is required", HttpStatus.BAD_REQUEST);
    }

    // Append new stage at the end
    const maxStage = await PipelineStage.findOne({ workspaceId: req.workspaceId })
      .sort({ order: -1 })
      .select("order");

    const newOrder = maxStage ? maxStage.order + 1 : 0;

    const stage = await PipelineStage.create({
      workspaceId: req.workspaceId,
      name,
      color: color || "#8e8e93",
      order: newOrder,
      isDefault: false,
    });

    // Notify all workspace members of the new stage
    SocketService.emitToWorkspace(req.workspaceId!, "pipeline:stage_created", { stage });

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { stage },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATCH /api/workspaces/:workspaceId/pipeline/:stageId
// Update a stage's name, color, or isDefault flag.
// ============================================================
export const updatePipelineStage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { stageId } = req.params;
    const { name, color, isDefault } = req.body;

    const stage = await PipelineStage.findOne({
      _id: stageId,
      workspaceId: req.workspaceId,
    });

    if (!stage) {
      throw new AppError(ErrorMessages.STAGE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (name) stage.name = name;
    if (color) stage.color = color;

    // If marking this stage as default, unset isDefault on all others first
    if (isDefault === true) {
      await PipelineStage.updateMany(
        { workspaceId: req.workspaceId, _id: { $ne: stageId } },
        { isDefault: false }
      );
      stage.isDefault = true;
    }

    await stage.save();

    SocketService.emitToWorkspace(req.workspaceId!, "pipeline:stage_updated", { stage });

    res.status(HttpStatus.OK).json({
      status: "success",
      data: { stage },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/workspaces/:workspaceId/pipeline/reorder
// Reorder all stages. Body: { stageIds: string[] } in new order.
// Uses bulkWrite for a single round trip.
// ============================================================
export const reorderPipelineStages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { stageIds } = req.body;

    if (!Array.isArray(stageIds) || stageIds.length === 0) {
      throw new AppError("stageIds array is required", HttpStatus.BAD_REQUEST);
    }

    // Build a bulk update setting the order for each stage
    const bulkOps = stageIds.map((id: string, idx: number) => ({
      updateOne: {
        filter: { _id: id, workspaceId: req.workspaceId },
        update: { order: idx },
      },
    }));

    await PipelineStage.bulkWrite(bulkOps);

    // Fetch the updated stages in new order to return to client
    const stages = await PipelineStage.find({ workspaceId: req.workspaceId })
      .sort({ order: 1 });

    SocketService.emitToWorkspace(req.workspaceId!, "pipeline:reordered", { stages });

    res.status(HttpStatus.OK).json({
      status: "success",
      data: { stages },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/workspaces/:workspaceId/pipeline/:stageId
// Delete a stage. Tasks in this stage are moved to the specified
// fallback stage (required). Cannot delete if it's the only stage.
// ============================================================
export const deletePipelineStage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { stageId } = req.params;
    const { fallbackStageId } = req.body;

    if (!fallbackStageId) {
      throw new AppError(
        "A fallback stage ID is required to reassign tasks",
        HttpStatus.BAD_REQUEST
      );
    }

    // Prevent deleting when it's the only stage
    const stageCount = await PipelineStage.countDocuments({ workspaceId: req.workspaceId });
    if (stageCount <= 1) {
      throw new AppError(ErrorMessages.CANNOT_DELETE_DEFAULT_STAGE, HttpStatus.BAD_REQUEST);
    }

    const stage = await PipelineStage.findOne({
      _id: stageId,
      workspaceId: req.workspaceId,
    });

    if (!stage) {
      throw new AppError(ErrorMessages.STAGE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Confirm fallback stage belongs to this workspace
    const fallback = await PipelineStage.findOne({
      _id: fallbackStageId,
      workspaceId: req.workspaceId,
    });

    if (!fallback) {
      throw new AppError("Fallback stage not found in this workspace", HttpStatus.BAD_REQUEST);
    }

    // Move all tasks in the deleted stage to the fallback stage
    await Task.updateMany(
      { workspaceId: req.workspaceId, stageId },
      { stageId: fallbackStageId }
    );

    await PipelineStage.findByIdAndDelete(stageId);

    SocketService.emitToWorkspace(req.workspaceId!, "pipeline:stage_deleted", {
      stageId,
      fallbackStageId,
    });

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Stage deleted and tasks reassigned",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
