// ============================================================
// controllers/lab.controller.ts
// Handles all Lab-level operations: creating a lab, managing
// members, and retrieving the workspaces under each lab.
// ============================================================
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Lab from "../models/lab.model";
import LabMember from "../models/labMember.model";
import Workspace from "../models/workspace.model";
import Member from "../models/member.model";
import Invitation from "../models/invitation.model";
import User from "../models/user.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages, LabRoles } from "../constants";
import type { LabRole } from "../constants";
import { sendEmail } from "../services/email.service";
import config from "../config";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

// ============================================================
// GET /api/labs
// Returns all labs the current user is a member of.
// ============================================================
export const getMyLabs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const memberships = await LabMember.find({ userId: req.user!._id })
      .populate<{ labId: InstanceType<typeof Lab> }>("labId")
      .lean();

    const labs = memberships
      .filter((m) => m.labId && !(m.labId as any).isArchived)
      .map((m) => ({
        _id: (m.labId as any)._id,
        name: (m.labId as any).name,
        description: (m.labId as any).description,
        institution: (m.labId as any).institution,
        logoUrl: (m.labId as any).logoUrl,
        ownerId: (m.labId as any).ownerId,
        role: m.role,
        joinedAt: m.joinedAt,
        createdAt: (m.labId as any).createdAt,
      }));

    res.status(HttpStatus.OK).json({
      status: "success",
      results: labs.length,
      data: { labs },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/labs
// Create a new lab. The creator is automatically added as Owner.
// ============================================================
export const createLab = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, description, institution } = req.body;

    if (!name) {
      throw new AppError("Lab name is required", HttpStatus.BAD_REQUEST);
    }

    // Create the lab
    const [lab] = await Lab.create(
      [
        {
          name,
          description,
          institution,
          ownerId: req.user!._id,
        },
      ],
      { session }
    );

    // Automatically add creator as Owner
    await LabMember.create(
      [
        {
          labId: lab._id,
          userId: req.user!._id,
          role: LabRoles.OWNER,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { lab },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ============================================================
// GET /api/labs/:labId
// Returns lab details + current user's role in it.
// ============================================================
export const getLabDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId } = req.params;

    const lab = await Lab.findById(labId);
    if (!lab || lab.isArchived) {
      throw new AppError(ErrorMessages.LAB_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify membership
    const membership = await LabMember.findOne({ labId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.NOT_LAB_MEMBER, HttpStatus.FORBIDDEN);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        lab,
        role: membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATCH /api/labs/:labId
// Update lab name, description, or institution. Owner only.
// ============================================================
export const updateLab = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId } = req.params;
    const { name, description, institution } = req.body;

    const lab = await Lab.findByIdAndUpdate(
      labId,
      { name, description, institution },
      { new: true, runValidators: true }
    );

    if (!lab) {
      throw new AppError(ErrorMessages.LAB_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: { lab },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/labs/:labId
// Soft-archive a lab. Owner only. Does not delete workspaces —
// they are archived individually.
// ============================================================
export const archiveLab = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId } = req.params;

    const lab = await Lab.findByIdAndUpdate(
      labId,
      { isArchived: true },
      { new: true }
    );

    if (!lab) {
      throw new AppError(ErrorMessages.LAB_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Lab archived successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/labs/:labId/members
// Returns all members of a lab with populated user info.
// ============================================================
export const getLabMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId } = req.params;

    const members = await LabMember.find({ labId })
      .populate("userId", "name email avatar lastLogin")
      .sort({ joinedAt: 1 });

    res.status(HttpStatus.OK).json({
      status: "success",
      results: members.length,
      data: { members },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/labs/:labId/invite
// Generate an invitation link for a new lab member.
// Lab Assistant and above can invite.
// ============================================================
export const inviteToLab = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId } = req.params;
    const { email, role = LabRoles.RESEARCHER } = req.body;

    if (!email) {
      throw new AppError("Email is required", HttpStatus.BAD_REQUEST);
    }

    const lab = await Lab.findById(labId);
    if (!lab || lab.isArchived) {
      throw new AppError(ErrorMessages.LAB_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Check if already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const existing = await LabMember.findOne({ labId, userId: existingUser._id });
      if (existing) {
        throw new AppError(ErrorMessages.ALREADY_LAB_MEMBER, HttpStatus.CONFLICT);
      }
    }

    // Revoke any pending invitations to this email for this lab
    await Invitation.updateMany(
      { workspaceId: labId, email: email.toLowerCase(), status: "pending" },
      { status: "revoked" }
    );

    // Generate a signed JWT invite token valid for 48 hours
    const token = jwt.sign(
      {
        labId: lab._id.toString(),
        email: email.toLowerCase(),
        role,
        type: "lab_invite",
      },
      config.jwt.secret,
      { expiresIn: "48h" }
    );

    const inviteLink = `${config.clientUrl}/join-lab/${token}`;

    // Persist invitation for tracking and revocation
    await Invitation.create({
      workspaceId: labId, // reuse the Invitation model — workspaceId holds labId
      email: email.toLowerCase(),
      role,
      token,
      invitedBy: req.user!._id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    logger.info(`📧 Lab invitation generated for ${email} → ${lab.name}`);

    // Send invitation email (non-blocking)
    const html = `
      <p>You've been invited to join the research lab <strong>${lab.name}</strong> on Research Collab as a ${role.replace("_", " ")}.</p>
      <p>Click <a href="${inviteLink}">here to accept your invitation</a>, or copy the link below:</p>
      <p>${inviteLink}</p>
      <p>This invitation expires in 48 hours.</p>
    `;

    sendEmail(email, `Join ${lab.name} on Research Collab`, html).catch((err) => {
      logger.error(`Failed to send lab invite email to ${email}:`, err);
    });

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Invitation link generated",
      data: { inviteLink, email, role },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/labs/accept-invite/:token
// Accept a lab invitation. The invitee must be authenticated.
// ============================================================
export const acceptLabInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.params.token as string;

    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch {
      throw new AppError("Invalid or expired invitation link", HttpStatus.BAD_REQUEST);
    }

    const { labId, email, role, type } = decoded;

    if (type !== "lab_invite") {
      throw new AppError("Invalid invitation type", HttpStatus.BAD_REQUEST);
    }

    // Email must match the authenticated user
    if (req.user!.email !== email) {
      throw new AppError(
        "This invitation was sent to a different email address",
        HttpStatus.FORBIDDEN
      );
    }

    const lab = await Lab.findById(labId);
    if (!lab || lab.isArchived) {
      throw new AppError("Lab no longer exists", HttpStatus.NOT_FOUND);
    }

    // Prevent duplicate membership
    const existingMembership = await LabMember.findOne({ labId, userId: req.user!._id });
    if (existingMembership) {
      await Invitation.findOneAndUpdate({ token, status: "pending" }, { status: "accepted" });
      res.status(HttpStatus.OK).json({
        status: "success",
        message: "You are already a member of this lab",
        data: { labId },
      });
      return;
    }

    // Add member to lab
    await LabMember.create({
      labId,
      userId: req.user!._id,
      role: role as LabRole,
    });

    // Mark invitation as accepted
    await Invitation.findOneAndUpdate({ token, status: "pending" }, { status: "accepted" });

    res.status(HttpStatus.CREATED).json({
      status: "success",
      message: `Successfully joined lab: ${lab.name}`,
      data: { labId },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATCH /api/labs/:labId/members/:userId/role
// Update a lab member's role. Owner only.
// ============================================================
export const updateLabMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId, userId } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(LabRoles).includes(role as LabRole)) {
      throw new AppError("Invalid role", HttpStatus.BAD_REQUEST);
    }

    const member = await LabMember.findOne({ labId, userId });
    if (!member) {
      throw new AppError("Member not found in this lab", HttpStatus.NOT_FOUND);
    }

    if (member.role === LabRoles.OWNER) {
      throw new AppError(ErrorMessages.CANNOT_CHANGE_OWNER_ROLE, HttpStatus.FORBIDDEN);
    }

    member.role = role as LabRole;
    await member.save();

    res.status(HttpStatus.OK).json({
      status: "success",
      data: { member },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/labs/:labId/members/:userId
// Remove a member from a lab. Owner can remove anyone.
// Members can remove themselves (leave).
// ============================================================
export const removeLabMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId, userId } = req.params;

    const member = await LabMember.findOne({ labId, userId });
    if (!member) {
      throw new AppError("Member not found", HttpStatus.NOT_FOUND);
    }

    if (member.role === LabRoles.OWNER) {
      throw new AppError(ErrorMessages.CANNOT_REMOVE_OWNER, HttpStatus.FORBIDDEN);
    }

    const isSelf = req.user!._id.toString() === userId;
    const requesterMembership = await LabMember.findOne({ labId, userId: req.user!._id });
    const isAuthorized =
      requesterMembership?.role === LabRoles.OWNER ||
      requesterMembership?.role === LabRoles.LAB_ASSISTANT;

    if (!isSelf && !isAuthorized) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    await LabMember.findByIdAndDelete(member._id);

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/labs/:labId/workspaces
// Returns all workspaces under the given lab.
// ============================================================
export const getLabWorkspaces = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { labId } = req.params;
    const { status } = req.query;

    const filter: any = { labId };
    if (status) {
      filter.status = status;
    } else {
      // By default exclude archived
      filter.status = { $ne: "archived" };
    }

    const workspaces = await Workspace.find(filter)
      .populate("ownerId", "name avatar")
      .sort({ createdAt: -1 });

    res.status(HttpStatus.OK).json({
      status: "success",
      results: workspaces.length,
      data: { workspaces },
    });
  } catch (error) {
    next(error);
  }
};
