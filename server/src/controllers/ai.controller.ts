import { Request, Response, NextFunction } from "express";
import AIService from "../services/ai.service";
import Member from "../models/member.model";
import Project from "../models/project.model";
import Task from "../models/task.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages } from "../constants";

export const getTaskBreakdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { description } = req.body;
    if (!description) {
      throw new AppError("Description is required", HttpStatus.BAD_REQUEST);
    }

    const subtasks = await AIService.breakdownTask(description);

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        subtasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSprintSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      throw new AppError("Project ID is required", HttpStatus.BAD_REQUEST);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Verify workspace membership
    const membership = await Member.findOne({ workspaceId: project.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Fetch tasks and populate stage info + assignees list
    const tasks = await Task.find({ projectId })
      .populate("assigneeIds", "name")
      .populate("stageId", "name");

    // Format tasks for AI consumption
    const formattedTasks = tasks.map((t) => ({
      title: t.title,
      stage: (t.stageId as any)?.name || "Unknown",
      priority: t.priority,
      assignees: t.assigneeIds.map((a: any) => a.name).join(", ") || "Unassigned",
      subtasksCompleted: `${t.subtasks.filter((s) => s.isCompleted).length}/${t.subtasks.length}`,
    }));

    const tasksJson = JSON.stringify(formattedTasks, null, 2);
    const summary = await AIService.summarizeSprint(tasksJson);

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLiteratureReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic } = req.body;
    if (!topic) {
      throw new AppError("Topic or abstract text is required", HttpStatus.BAD_REQUEST);
    }

    const review = await AIService.generateLiteratureReview(topic);

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeError = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { errorLog } = req.body;
    if (!errorLog) {
      throw new AppError("Error log content is required", HttpStatus.BAD_REQUEST);
    }

    const analysis = await AIService.explainError(errorLog);

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const parseNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notes } = req.body;
    if (!notes) {
      throw new AppError("Notes content is required", HttpStatus.BAD_REQUEST);
    }

    const tasks = await AIService.parseMeetingNotes(notes);

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};
