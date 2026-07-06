// ============================================================
// middleware/labAuthorize.ts
// Middleware factories for enforcing Lab role permissions.
// These guard Lab-level routes (not workspace-level).
// ============================================================
import { Request, Response, NextFunction } from "express";
import LabMember from "../models/labMember.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages, LabRoles } from "../constants";
import type { LabRole } from "../constants";

// ===== Extend Request to carry lab context =====
declare global {
  namespace Express {
    interface Request {
      labRole?: LabRole;
      labId?: string;
    }
  }
}

/**
 * Checks that the authenticated user is a member of the lab
 * specified by req.params.labId, and attaches their role.
 * Optionally restricts to the given allowed roles.
 */
const labAuthorize = (allowedRoles: LabRole[] = Object.values(LabRoles)) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError(ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED));
      }

      const labId = req.params.labId as string;
      if (!labId) {
        return next(new AppError("Lab ID is required", HttpStatus.BAD_REQUEST));
      }

      const membership = await LabMember.findOne({ labId, userId: req.user._id });

      if (!membership) {
        return next(new AppError(ErrorMessages.NOT_LAB_MEMBER, HttpStatus.FORBIDDEN));
      }

      if (!allowedRoles.includes(membership.role)) {
        return next(new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN));
      }

      // Attach lab context for downstream controllers
      req.labRole = membership.role;
      req.labId = labId;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/** Only the PI (Owner) can perform this action */
export const labOwnerOnly = labAuthorize([LabRoles.OWNER]);

/** Owner and Lab Assistant can perform this action */
export const labManagerOrAbove = labAuthorize([LabRoles.OWNER, LabRoles.LAB_ASSISTANT]);

/** Owner, Lab Assistant, and Researcher can perform this action */
export const labResearcherOrAbove = labAuthorize([
  LabRoles.OWNER,
  LabRoles.LAB_ASSISTANT,
  LabRoles.RESEARCHER,
]);

/** Any lab member can perform this action */
export const anyLabMember = labAuthorize();

export default labAuthorize;
