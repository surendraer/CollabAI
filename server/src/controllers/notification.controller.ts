// ============================================================
// controllers/notification.controller.ts
// Handles fetching and marking notifications as read for a user.
// ============================================================
import { Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import AppError from "../utils/AppError";
import { HttpStatus } from "../constants";

// ============================================================
// GET /api/notifications
// Retrieves the last 30 notifications for the authenticated user.
// ============================================================
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipientId: req.user!._id })
      .populate("actorId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(HttpStatus.OK).json({
      status: "success",
      results: notifications.length,
      data: {
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATCH /api/notifications/:notificationId/read
// Marks a single notification as read.
// ============================================================
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: req.user!._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError("Notification not found", HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        notification,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/notifications/read-all
// Marks all unread notifications of the user as read.
// ============================================================
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Notification.updateMany(
      { recipientId: req.user!._id, isRead: false },
      { isRead: true }
    );

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "All notifications marked as read",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
