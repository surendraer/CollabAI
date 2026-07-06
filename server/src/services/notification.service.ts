// ============================================================
// services/notification.service.ts
// Standardized service to create notifications, send real-time
// socket updates, and trigger email dispatches.
// ============================================================
import Notification, { NotificationType } from "../models/notification.model";
import SocketService from "./socket.service";
import { sendEmail } from "./email.service";
import User from "../models/user.model";
import logger from "../utils/logger";

interface CreateNotificationInput {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  message: string;
  meta?: {
    workspaceId?: string;
    taskId?: string;
    labId?: string;
  };
  sendEmailAlert?: boolean;
}

export class NotificationService {
  /**
   * Dispatches an in-app notification + optionally sends email alert
   */
  public static async notify(input: CreateNotificationInput): Promise<void> {
    try {
      const { recipientId, actorId, type, message, meta, sendEmailAlert } = input;

      // Save notification to MongoDB
      const notification = await Notification.create({
        recipientId,
        actorId: actorId || undefined,
        type,
        message,
        meta,
      });

      // Populate actor if set for the socket payload
      const populated = await Notification.findById(notification._id)
        .populate("actorId", "name avatar")
        .lean();

      // Emit real-time Socket event directly to the user's personal room
      SocketService.emitToUser(recipientId, "notification:new", populated);
      logger.info(`🔔 Notification dispatched to User ${recipientId}: ${message}`);

      // Send email alert if requested
      if (sendEmailAlert) {
        const recipient = await User.findById(recipientId).select("email name");
        if (recipient) {
          const html = `
            <p>Hello ${recipient.name},</p>
            <p>${message}</p>
            <p>Log in to your dashboard to view details and respond.</p>
            <hr />
            <p style="font-size: 11px; color: #7a7a7a;">
              You received this email because you are a collaborator on Research Collab.
            </p>
          `;
          sendEmail(recipient.email, `Alert: ${message}`, html).catch((err) => {
            logger.error(`❌ Failed to send alert email to ${recipient.email}:`, err);
          });
        }
      }
    } catch (error) {
      logger.error("❌ Notification Service error:", error);
    }
  }

  /**
   * Helper to parse @mentions in text and notify those users
   */
  public static async notifyMentions(
    text: string,
    actorId: string,
    meta: { workspaceId?: string; taskId?: string },
    contextMessage: string
  ): Promise<string[]> {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const matches = text.match(mentionRegex);
    if (!matches || matches.length === 0) return [];

    const usernames = matches.map((m) => m.substring(1)); // remove '@'
    
    // Find users with matching names
    const users = await User.find({ name: { $in: usernames } }).select("_id name");
    const notifiedIds: string[] = [];

    for (const user of users) {
      // Don't notify oneself
      if (user._id.toString() === actorId) continue;

      await this.notify({
        recipientId: user._id.toString(),
        actorId,
        type: "mentioned",
        message: contextMessage,
        meta,
        sendEmailAlert: true, // Always email mentions
      });

      notifiedIds.push(user._id.toString());
    }

    return notifiedIds;
  }
}

export default NotificationService;
