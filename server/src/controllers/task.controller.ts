import { Request, Response, NextFunction } from "express";
import Task from "../models/task.model";
import Member from "../models/member.model";
import Project from "../models/project.model";
import ActivityLog from "../models/activityLog.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages } from "../constants";
import SocketService from "../services/socket.service";
import PipelineStage from "../models/pipelineStage.model";
import NotificationService from "../services/notification.service";
import mongoose from "mongoose";

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      projectId,
      workspaceId,
      assigneeId,
      assigneeIds,
      priority,
      status,
      stageId,
      dueDate,
      type,
      labels,
    } = req.body;

    if (!title || !projectId || !workspaceId) {
      throw new AppError("Title, project ID, and workspace ID are required", HttpStatus.BAD_REQUEST);
    }

    // Verify workspace membership
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Resolve stageId (prefer stageId, fallback to finding a matching default stage or first stage)
    let finalStageId = stageId;
    if (!finalStageId) {
      // Find default stage for this workspace
      const defaultStage = await PipelineStage.findOne({ workspaceId, isDefault: true });
      if (defaultStage) {
        finalStageId = defaultStage._id;
      } else {
        // Fallback to first stage
        const firstStage = await PipelineStage.findOne({ workspaceId }).sort({ order: 1 });
        if (firstStage) {
          finalStageId = firstStage._id;
        } else {
          // If no stages exist yet (e.g. newly migrated workspaces), create default ones
          const defaultCreated = await PipelineStage.create([
            { workspaceId, name: "Upcoming Milestones", color: "#8e8e93", order: 0, isDefault: true },
            { workspaceId, name: "Active Research", color: "#0066cc", order: 1, isDefault: false },
            { workspaceId, name: "Completed & Approved", color: "#34c759", order: 2, isDefault: false }
          ]);
          finalStageId = defaultCreated[0]._id;
        }
      }
    }

    // Map assigneeId / assigneeIds for backward compatibility
    let finalAssignees: string[] = [];
    if (Array.isArray(assigneeIds)) {
      finalAssignees = assigneeIds;
    } else if (assigneeId) {
      finalAssignees = [assigneeId];
    }

    // Get count of existing tasks in this stage to append at the end of the column
    const existingCount = await Task.countDocuments({ projectId, stageId: finalStageId });

    const newTask = new Task({
      title,
      description,
      projectId,
      workspaceId,
      stageId: finalStageId,
      assigneeIds: finalAssignees,
      priority: priority || "medium",
      dueDate,
      columnOrder: existingCount,
      type: type || "task",
      labels: labels || [],
    });

    await newTask.save();

    // Log Activity
    const log = new ActivityLog({
      workspaceId,
      projectId,
      taskId: newTask._id,
      userId: req.user!._id,
      action: "task_created",
      details: `created task "${newTask.title}"`,
    });
    await log.save();

    // Emit Real-time update
    SocketService.emitToWorkspace(workspaceId, "task:created", {
      task: newTask,
      user: {
        _id: req.user!._id,
        name: req.user!.name,
      },
    });

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: {
        task: newTask,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { stageId, priority, assigneeId, search } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify membership
    const membership = await Member.findOne({ workspaceId: project.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Build filter query
    const filterQuery: any = { projectId };

    if (stageId) filterQuery.stageId = stageId;
    if (priority) filterQuery.priority = priority;
    if (assigneeId) filterQuery.assigneeIds = assigneeId;
    if (search) {
      filterQuery.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(filterQuery)
      .populate("assigneeIds", "name email avatar")
      .populate("comments.sender", "name avatar")
      .populate("attachments")
      .sort({ columnOrder: 1 });

    res.status(HttpStatus.OK).json({
      status: "success",
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("assigneeIds", "name email avatar")
      .populate("comments.sender", "name avatar")
      .populate("attachments");

    if (!task) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify membership
    const membership = await Member.findOne({ workspaceId: task.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      assigneeId,
      assigneeIds,
      priority,
      status, // fallback compatibility
      stageId,
      dueDate,
      reminderAt,
      labels,
      type,
    } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify membership
    const membership = await Member.findOne({ workspaceId: task.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const changes: string[] = [];
    if (title && title !== task.title) {
      changes.push(`renamed task to "${title}"`);
      task.title = title;
    }
    if (description !== undefined && description !== task.description) {
      changes.push(`updated description`);
      task.description = description;
    }

    // Handle assignee updates
    if (Array.isArray(assigneeIds)) {
      changes.push("updated assignees");
      task.assigneeIds = assigneeIds.map((id: string) => new mongoose.Types.ObjectId(id));
    } else if (assigneeId !== undefined) {
      changes.push("updated assignee");
      task.assigneeIds = assigneeId ? [new mongoose.Types.ObjectId(assigneeId)] : [];
    }

    if (priority && priority !== task.priority) {
      changes.push(`set priority to "${priority}"`);
      task.priority = priority;
    }

    // Handle stage change
    const targetStageId = stageId || status; // support old parameter as fallback
    if (targetStageId && targetStageId !== task.stageId?.toString()) {
      changes.push(`moved stage`);
      task.stageId = new mongoose.Types.ObjectId(targetStageId);
    }

    if (dueDate !== undefined && dueDate !== task.dueDate?.toISOString()) {
      changes.push(`updated due date`);
      task.dueDate = dueDate ? new Date(dueDate) : undefined;
    }
    if (reminderAt !== undefined && reminderAt !== task.reminderAt?.toISOString()) {
      changes.push(`updated reminder time`);
      task.reminderAt = reminderAt ? new Date(reminderAt) : undefined;
    }
    if (Array.isArray(labels)) {
      changes.push(`updated labels`);
      task.labels = labels;
    }
    if (type && type !== task.type) {
      changes.push(`changed type to "${type}"`);
      task.type = type;
    }

    if (changes.length > 0) {
      await task.save();

      // Log activity
      const log = new ActivityLog({
        workspaceId: task.workspaceId,
        projectId: task.projectId,
        taskId: task._id,
        userId: req.user!._id,
        action: "task_updated",
        details: changes.join(", "),
      });
      await log.save();

      // Broadcast Socket.IO update
      SocketService.emitToWorkspace(task.workspaceId.toString(), "task:updated", {
        task,
        user: { _id: req.user!._id, name: req.user!.name },
      });
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Highly optimized Kanban card reordering using bulkWrite
 */
export const moveTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stageId, status, targetOrder } = req.body; // targetOrder: number, stageId or status: string
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Support status fallback for drag and drop moves during API transition
    const targetStageId = stageId || status;
    if (!targetStageId) {
      throw new AppError("stageId is required to move task", HttpStatus.BAD_REQUEST);
    }

    const originalStageId = task.stageId?.toString() || "";
    const originalOrder = task.columnOrder;
    const workspaceId = task.workspaceId.toString();

    // Verify membership
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Fetch tasks in target stage
    const targetTasks = await Task.find({ projectId: task.projectId, stageId: targetStageId }).sort({ columnOrder: 1 });

    // Handle re-ordering logic within same column vs different column
    if (originalStageId === targetStageId) {
      // Filter out the moving task first
      const cleanTasks = targetTasks.filter((t) => t._id.toString() !== task._id.toString());
      // Insert at target position
      cleanTasks.splice(targetOrder, 0, task);

      // Create bulk write operations to update index columnOrder in one database trip
      const bulkOps = cleanTasks.map((t, idx) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { columnOrder: idx },
        },
      }));

      await Task.bulkWrite(bulkOps);
      task.columnOrder = targetOrder;
    } else {
      // 1. Update orders in original column
      const sourceTasks = await Task.find({ projectId: task.projectId, stageId: originalStageId }).sort({ columnOrder: 1 });
      const cleanSource = sourceTasks.filter((t) => t._id.toString() !== task._id.toString());
      const sourceBulkOps = cleanSource.map((t, idx) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { columnOrder: idx },
        },
      }));
      if (sourceBulkOps.length > 0) {
        await Task.bulkWrite(sourceBulkOps);
      }

      // 2. Insert into target column
      targetTasks.splice(targetOrder, 0, task);
      const targetBulkOps = targetTasks.map((t, idx) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { columnOrder: idx, stageId: targetStageId },
        },
      }));
      await Task.bulkWrite(targetBulkOps);
      
      task.stageId = new mongoose.Types.ObjectId(targetStageId);
      task.columnOrder = targetOrder;
    }

    // Log Activity
    const log = new ActivityLog({
      workspaceId: task.workspaceId,
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user!._id,
      action: "task_moved",
      details: `moved task card within stages`,
    });
    await log.save();

    // Broadcast move event via Socket.IO
    SocketService.emitToWorkspace(workspaceId, "task:moved", {
      taskId: task._id,
      projectId: task.projectId,
      stageId: targetStageId,
      targetOrder,
      originalStageId,
      originalOrder,
      user: { _id: req.user!._id, name: req.user!.name },
    });

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Task moved successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify membership
    const membership = await Member.findOne({ workspaceId: task.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    await Task.findByIdAndDelete(req.params.taskId);

    // Clean up following indexes in the column
    const columnTasks = await Task.find({ projectId: task.projectId, stageId: task.stageId }).sort({ columnOrder: 1 });
    const bulkOps = columnTasks.map((t, idx) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { columnOrder: idx },
      },
    }));
    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    // Log activity
    const log = new ActivityLog({
      workspaceId: task.workspaceId,
      projectId: task.projectId,
      userId: req.user!._id,
      action: "task_deleted",
      details: `deleted task "${task.title}"`,
    });
    await log.save();

    // Emit Socket event
    SocketService.emitToWorkspace(task.workspaceId.toString(), "task:deleted", {
      taskId: task._id,
      projectId: task.projectId,
    });

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ===== Comments =====

export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) {
      throw new AppError("Comment content is required", HttpStatus.BAD_REQUEST);
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const membership = await Member.findOne({ workspaceId: task.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Parse and notify mentioned users
    const notifiedIds = await NotificationService.notifyMentions(
      content,
      req.user!._id.toString(),
      { workspaceId: task.workspaceId.toString(), taskId: task._id.toString() },
      `${req.user!.name} mentioned you in a comment on "${task.title}": "${content.substring(0, 40)}${content.length > 40 ? "..." : ""}"`
    );

    const newComment = {
      sender: req.user!._id,
      content,
      mentions: notifiedIds.map((id) => new mongoose.Types.ObjectId(id)),
      isEdited: false,
      createdAt: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    // Log Activity
    const log = new ActivityLog({
      workspaceId: task.workspaceId,
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user!._id,
      action: "comment_added",
      details: `added comment: "${content.substring(0, 30)}..."`,
    });
    await log.save();

    // Emit Socket comment broadcast
    SocketService.emitToWorkspace(task.workspaceId.toString(), "comment:added", {
      taskId: task._id,
      comment: {
        ...newComment,
        sender: {
          _id: req.user!._id,
          name: req.user!.name,
          avatar: req.user!.avatar,
        },
      },
    });

    // Notify task assignee(s) if the commenter is someone else
    const assigneesToNotify = task.assigneeIds.filter(
      (id) => id.toString() !== req.user!._id.toString() && !notifiedIds.includes(id.toString())
    );

    for (const assigneeId of assigneesToNotify) {
      await NotificationService.notify({
        recipientId: assigneeId.toString(),
        actorId: req.user!._id.toString(),
        type: "comment_added",
        message: `${req.user!.name} commented on your task "${task.title}"`,
        meta: { workspaceId: task.workspaceId.toString(), taskId: task._id.toString() },
      });
    }

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== Subtasks =====

export const toggleSubtask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { subtaskId } = req.params;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const membership = await Member.findOne({ workspaceId: task.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const subtask = task.subtasks.find((s) => s._id?.toString() === subtaskId);
    if (!subtask) {
      throw new AppError("Subtask not found", HttpStatus.NOT_FOUND);
    }

    subtask.isCompleted = !subtask.isCompleted;
    await task.save();

    // Emit socket event
    SocketService.emitToWorkspace(task.workspaceId.toString(), "subtask:toggled", {
      taskId: task._id,
      subtask,
    });

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== Activity Logs =====

export const getWorkspaceActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    // Verify membership
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const logs = await ActivityLog.find({ workspaceId })
      .populate("userId", "name avatar")
      .populate("taskId", "title")
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        logs,
      },
    });
  } catch (error) {
    next(error);
  }
};
