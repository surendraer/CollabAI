import { Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages } from "../constants";

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipient: req.user!._id })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);

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

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user!._id },
      { read: true },
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

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ recipient: req.user!._id, read: false }, { read: true });

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "All notifications marked as read",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
