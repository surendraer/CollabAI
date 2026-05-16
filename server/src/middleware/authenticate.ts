import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import User, { IUser } from "../models/user.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages, CookieNames } from "../constants";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    let token =
      req.cookies?.[CookieNames.ACCESS_TOKEN] ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
    };

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(
        new AppError(ErrorMessages.INVALID_TOKEN, HttpStatus.UNAUTHORIZED)
      );
    } else {
      next(
        new AppError(ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      );
    }
  }
};

export default authenticate;
