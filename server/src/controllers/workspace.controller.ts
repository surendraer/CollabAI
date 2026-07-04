import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Workspace from "../models/workspace.model";
import Member from "../models/member.model";
import User from "../models/user.model";
import AppError from "../utils/AppError";
import { HttpStatus, WorkspaceRoles, ErrorMessages } from "../constants";
import config from "../config";
import logger from "../utils/logger";
import { sendEmail } from "../services/email.service";

export const createWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, description } = req.body;

    if (!name) {
      throw new AppError("Workspace name is required", HttpStatus.BAD_REQUEST);
    }

    const newWorkspace = new Workspace({
      name,
      description,
      owner: req.user!._id,
    });

    await newWorkspace.save({ session });

    // Automatically add creator as Owner
    const newMember = new Member({
      workspaceId: newWorkspace._id,
      userId: req.user!._id,
      role: WorkspaceRoles.OWNER,
    });

    await newMember.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: {
        workspace: newWorkspace,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getWorkspaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Find all workspace memberships for user
    const memberships = await Member.find({ userId: req.user!._id }).populate("workspaceId");

    // Extract valid workspaces
    const workspaces = memberships
      .filter((m) => m.workspaceId !== null)
      .map((m) => {
        const ws = m.workspaceId as any;
        return {
          _id: ws._id,
          name: ws.name,
          description: ws.description,
          owner: ws.owner,
          role: m.role,
          joinedAt: m.joinedAt,
          createdAt: ws.createdAt,
        };
      });

    res.status(HttpStatus.OK).json({
      status: "success",
      results: workspaces.length,
      data: {
        workspaces,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workspace = await Workspace.findById(req.workspaceId);
    if (!workspace) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        workspace,
        role: req.workspaceRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.findByIdAndUpdate(
      req.workspaceId,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!workspace) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        workspace,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await Workspace.findById(req.workspaceId);
    if (!workspace) {
      throw new AppError(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Delete members
    await Member.deleteMany({ workspaceId: req.workspaceId }, { session });
    // Delete workspace itself
    await Workspace.findByIdAndDelete(req.workspaceId, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const inviteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, role = WorkspaceRoles.MEMBER } = req.body;

    if (!email) {
      throw new AppError("Email is required", HttpStatus.BAD_REQUEST);
    }

    const workspace = await Workspace.findById(req.workspaceId);
    if (!workspace) {
      throw new AppError("Workspace not found", HttpStatus.NOT_FOUND);
    }

    // Generate stateless invitation token (expires in 48 hours)
    const token = jwt.sign(
      {
        workspaceId: workspace._id.toString(),
        email: email.toLowerCase(),
        role,
      },
      config.jwt.secret,
      { expiresIn: "48h" }
    );

    const inviteLink = `${config.clientUrl}/join/${token}`;
    logger.info(`📧 Invitation link generated for ${email}: ${inviteLink}`);

    const html = `<p>You have been invited to join the workspace <strong>${workspace.name}</strong> as a ${role}.</p>
                 <p>Click <a href="${inviteLink}">here</a> to join, or copy the link below into your browser:</p>
                 <p>${inviteLink}</p>
                 <p>This link will expire in 48 hours.</p>`;

    await sendEmail(email, `Join ${workspace.name} on CollabAI`, html);

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Invitation link generated",
      data: {
        inviteLink,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;

    if (!token) {
      throw new AppError("Invitation token is required", HttpStatus.BAD_REQUEST);
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch {
      throw new AppError("Invalid or expired invitation token", HttpStatus.BAD_REQUEST);
    }

    const { workspaceId, email, role } = decoded;

    // Check if current user email matches invitation
    if (req.user!.email !== email) {
      throw new AppError("This invitation was sent to a different email address", HttpStatus.FORBIDDEN);
    }

    // Verify workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new AppError("Workspace no longer exists", HttpStatus.NOT_FOUND);
    }

    // Check if already a member
    const existingMember = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (existingMember) {
      res.status(HttpStatus.OK).json({
        status: "success",
        message: "You are already a member of this workspace",
        data: {
          workspaceId,
        },
      });
      return;
    }

    // Add member
    const newMember = new Member({
      workspaceId,
      userId: req.user!._id,
      role,
    });
    await newMember.save();

    res.status(HttpStatus.CREATED).json({
      status: "success",
      message: "Successfully joined workspace",
      data: {
        workspaceId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const members = await Member.find({ workspaceId: req.workspaceId })
      .populate("userId", "name email avatar")
      .select("role joinedAt");

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(WorkspaceRoles).includes(role)) {
      throw new AppError("Invalid workspace role", HttpStatus.BAD_REQUEST);
    }

    // Don't allow changing owner role directly
    const memberToUpdate = await Member.findOne({ workspaceId: req.workspaceId, userId });
    if (!memberToUpdate) {
      throw new AppError("Member not found", HttpStatus.NOT_FOUND);
    }

    if (memberToUpdate.role === WorkspaceRoles.OWNER) {
      throw new AppError("Cannot change owner's role. Transfer ownership instead.", HttpStatus.FORBIDDEN);
    }

    memberToUpdate.role = role;
    await memberToUpdate.save();

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        member: memberToUpdate,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    const memberToRemove = await Member.findOne({ workspaceId: req.workspaceId, userId });
    if (!memberToRemove) {
      throw new AppError("Member not found", HttpStatus.NOT_FOUND);
    }

    if (memberToRemove.role === WorkspaceRoles.OWNER) {
      throw new AppError("Cannot remove workspace owner", HttpStatus.FORBIDDEN);
    }

    // Users can remove themselves, otherwise requires Admin/Owner
    const isSelf = req.user!._id.toString() === userId;
    const isAuthorized = req.workspaceRole === WorkspaceRoles.OWNER || req.workspaceRole === WorkspaceRoles.ADMIN;

    if (!isSelf && !isAuthorized) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    await Member.findByIdAndDelete(memberToRemove._id);

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
