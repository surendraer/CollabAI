import { Request, Response, NextFunction } from "express";
import Member from "../models/member.model";
import Project from "../models/project.model";
import Task from "../models/task.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages, WorkspaceRoles } from "../constants";
import type { WorkspaceRole } from "../constants";

declare global {
  namespace Express {
    interface Request {
      workspaceRole?: WorkspaceRole;
      workspaceId?: string;
    }
  }
}

/**
 * Middleware to authorize workspace members based on their roles.
 * Resolves workspace context from:
 * 1. req.params.workspaceId (or req.params.id if it represents a workspace)
 * 2. req.body.workspaceId or req.query.workspaceId
 * 3. req.params.projectId (fetches workspaceId from Project model)
 * 4. req.params.taskId (fetches workspaceId from Task model)
 */
export const workspaceAuthorize = (allowedRoles: WorkspaceRole[] = Object.values(WorkspaceRoles)) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError(ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED));
      }

      let workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId as string;

      // Handle routes where workspace is :id
      if (!workspaceId && req.baseUrl.includes("/workspaces") && req.params.id) {
        workspaceId = req.params.id;
      }

      // Handle project parameters
      if (!workspaceId && req.params.projectId) {
        const project = await Project.findById(req.params.projectId).select("workspaceId");
        if (project) {
          workspaceId = project.workspaceId.toString();
        }
      } else if (!workspaceId && req.params.id && req.baseUrl.includes("/projects")) {
        const project = await Project.findById(req.params.id).select("workspaceId");
        if (project) {
          workspaceId = project.workspaceId.toString();
        }
      }

      // Handle task parameters
      if (!workspaceId && req.params.taskId) {
        const task = await Task.findById(req.params.taskId).select("workspaceId");
        if (task) {
          workspaceId = task.workspaceId.toString();
        }
      } else if (!workspaceId && req.params.id && req.baseUrl.includes("/tasks")) {
        const task = await Task.findById(req.params.id).select("workspaceId");
        if (task) {
          workspaceId = task.workspaceId.toString();
        }
      }

      if (!workspaceId) {
        return next(new AppError("Workspace context is required", HttpStatus.BAD_REQUEST));
      }

      // Find membership
      const membership = await Member.findOne({
        workspaceId,
        userId: req.user._id,
      });

      if (!membership) {
        return next(new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN));
      }

      // Check role
      if (!allowedRoles.includes(membership.role)) {
        return next(new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN));
      }

      // Attach context to request
      req.workspaceRole = membership.role;
      req.workspaceId = workspaceId;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default workspaceAuthorize;
