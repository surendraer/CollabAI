import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages } from "../constants";
import type { SystemRole } from "../constants";

const authorize = (...allowedRoles: SystemRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError(ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      );
    }

    if (!allowedRoles.includes(req.user.role as SystemRole)) {
      return next(
        new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN)
      );
    }

    next();
  };
};

export default authorize;
