// ============================================================
// models/notification.model.ts
// In-app notifications targeted at specific users.
// Types include: task_assigned, mentioned, deadline_reminder,
// member_joined, invite_accepted.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "mentioned"
  | "deadline_reminder"
  | "member_joined"
  | "invite_accepted"
  | "comment_added"
  | "stage_updated";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  /** The user who receives this notification */
  recipientId: mongoose.Types.ObjectId;
  /** The user who triggered the action (null for system notifications) */
  actorId?: mongoose.Types.ObjectId;
  type: NotificationType;
  /** Human-readable message, e.g. "Alice mentioned you in a comment" */
  message: string;
  /** Optional deep-link data: workspaceId, taskId, etc. */
  meta: {
    workspaceId?: string;
    taskId?: string;
    labId?: string;
  };
  /** Whether the notification has been read by the recipient */
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "task_assigned",
        "task_updated",
        "mentioned",
        "deadline_reminder",
        "member_joined",
        "invite_accepted",
        "comment_added",
        "stage_updated",
      ],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    meta: {
      workspaceId: String,
      taskId: String,
      labId: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Fast retrieval of all unread notifications for a user
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
