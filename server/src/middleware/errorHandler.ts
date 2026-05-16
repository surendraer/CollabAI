import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";
import config from "../config";

interface ErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errors: Record<string, string[]> | undefined;

  // Known operational error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
    const mongooseErr = err as any;
    errors = {};
    Object.keys(mongooseErr.errors).forEach((key) => {
      errors![key] = [mongooseErr.errors[key].message];
    });
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${err.message}`, {
      stack: err.stack,
    });
  } else {
    logger.warn(`${statusCode} - ${err.message}`);
  }

  const response: ErrorResponse = {
    status: "error",
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (!config.isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
