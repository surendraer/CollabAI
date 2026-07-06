// ============================================================
// controllers/dm.controller.ts
// Handles 1-on-1 direct messaging between lab collaborators.
// ============================================================
import { Request, Response, NextFunction } from "express";
import Message from "../models/message.model";
import User from "../models/user.model";
import SocketService from "../services/socket.service";
import NotificationService from "../services/notification.service";
import AppError from "../utils/AppError";
import { HttpStatus, Pagination } from "../constants";

// ============================================================
// GET /api/messages/dm/:recipientId
// Fetches the last 100 DM messages between current user & recipient.
// ============================================================
export const getDirectMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipientId = req.params.recipientId as string;
    const currentUserId = req.user!._id.toString();

    // Confirm recipient exists
    const recipient = await User.findById(recipientId).select("name avatar");
    if (!recipient) {
      throw new AppError("Recipient not found", HttpStatus.NOT_FOUND);
    }

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId },
        { senderId: recipientId, recipientId: currentUserId },
      ],
      workspaceId: { $exists: false }, // only return 1-on-1 DMs
    })
      .populate("senderId", "name avatar")
      .populate("recipientId", "name avatar")
      .populate("attachments")
      .sort({ createdAt: -1 })
      .limit(Pagination.DM_LIMIT);

    // Return in chronological order
    const sortedMessages = messages.reverse();

    res.status(HttpStatus.OK).json({
      status: "success",
      results: sortedMessages.length,
      data: { messages: sortedMessages },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/messages/dm/:recipientId
// Send a direct message to a user. Emits 'dm:new' real-time event.
// ============================================================
export const sendDirectMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipientId = req.params.recipientId as string;
    const { content, attachments } = req.body;
    const currentUserId = req.user!._id.toString();

    if (!content && (!attachments || attachments.length === 0)) {
      throw new AppError("Message content or attachment is required", HttpStatus.BAD_REQUEST);
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new AppError("Recipient not found", HttpStatus.NOT_FOUND);
    }

    const message = await Message.create({
      senderId: currentUserId,
      recipientId,
      content: content || "",
      attachments: attachments || [],
    });

    const populated = await Message.findById(message._id)
      .populate("senderId", "name avatar")
      .populate("recipientId", "name avatar")
      .populate("attachments");

    // Emit live update to recipient's personal room & sender's personal room
    SocketService.emitToUser(recipientId, "dm:new", populated);
    SocketService.emitToUser(currentUserId, "dm:new", populated);

    // Send a push/in-app notification to the recipient if they aren't online
    const isOnline = SocketService.isUserOnline(recipientId);
    if (!isOnline) {
      await NotificationService.notify({
        recipientId,
        actorId: currentUserId,
        type: "mentioned", // DM notification
        message: `${req.user!.name} sent you a direct message: "${content.substring(0, 40)}${content.length > 40 ? "..." : ""}"`,
        sendEmailAlert: true, // Send email notification if offline
      });
    }

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { message: populated },
    });
  } catch (error) {
    next(error);
  }
};
