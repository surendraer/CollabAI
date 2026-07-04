import { Request, Response, NextFunction } from "express";
import Project from "../models/project.model";
import Member from "../models/member.model";
import Task from "../models/task.model";
import AppError from "../utils/AppError";
import { HttpStatus, WorkspaceRoles, ErrorMessages } from "../constants";

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, workspaceId } = req.body;

    if (!name || !workspaceId) {
      throw new AppError("Name and workspace ID are required", HttpStatus.BAD_REQUEST);
    }

    // Verify user is member of the workspace
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const newProject = new Project({
      name,
      description,
      workspaceId,
      ownerId: req.user!._id,
    });

    await newProject.save();

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: {
        project: newProject,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    // Verify membership
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const projects = await Project.find({ workspaceId, status: "active" });

    res.status(HttpStatus.OK).json({
      status: "success",
      results: projects.length,
      data: {
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify user is member of workspace
    const membership = await Member.findOne({ workspaceId: project.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify workspace membership
    const membership = await Member.findOne({ workspaceId: project.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Must be project owner, workspace owner, or workspace admin to edit
    const isOwner = project.ownerId.toString() === req.user!._id.toString();
    const isWorkspaceAdmin = membership.role === WorkspaceRoles.OWNER || membership.role === WorkspaceRoles.ADMIN;

    if (!isOwner && !isWorkspaceAdmin) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify membership
    const membership = await Member.findOne({ workspaceId: project.workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Must be project owner, workspace owner, or workspace admin to delete
    const isOwner = project.ownerId.toString() === req.user!._id.toString();
    const isWorkspaceAdmin = membership.role === WorkspaceRoles.OWNER || membership.role === WorkspaceRoles.ADMIN;

    if (!isOwner && !isWorkspaceAdmin) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Soft delete by archiving, or hard delete? Let's soft delete (status: archived)
    project.status = "archived";
    await project.save();

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
