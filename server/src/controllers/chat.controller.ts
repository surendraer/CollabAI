import { Request, Response, NextFunction } from "express";
import Message from "../models/message.model";
import Member from "../models/member.model";
import AppError from "../utils/AppError";
import { HttpStatus, ErrorMessages } from "../constants";
import SocketService from "../services/socket.service";
import { triggerPusher, isPusherConfigured } from "../utils/pusher";

export const getWorkspaceMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workspaceId = req.params.workspaceId as string;

    // Verify workspace membership
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const messages = await Message.find({ workspaceId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(HttpStatus.OK).json({
      status: "success",
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const { content, projectId } = req.body;

    if (!content) {
      throw new AppError("Message content is required", HttpStatus.BAD_REQUEST);
    }

    // Verify membership
    const membership = await Member.findOne({ workspaceId, userId: req.user!._id });
    if (!membership) {
      throw new AppError(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const newMessage = new Message({
      content,
      sender: req.user!._id,
      workspaceId,
      projectId: projectId || undefined,
    });

    await newMessage.save();

    // Populate sender details for immediate UI rendering
    const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name avatar");

    const payload = { message: populatedMessage };

    // Broadcast via Pusher (preferred — works cross-domain without cookie issues)
    if (isPusherConfigured()) {
      await triggerPusher(`workspace-${workspaceId}`, "chat:message", payload);
    }

    // Also broadcast via Socket.IO (fallback / local dev)
    SocketService.emitToWorkspace(workspaceId, "chat:message", payload);

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};
