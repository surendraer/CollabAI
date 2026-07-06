// ============================================================
// models/message.model.ts
// Handles both group chat messages (scoped to a workspace) and
// 1-on-1 direct messages between lab members.
// Group chat: workspaceId is set, recipientId is null.
// Direct message: workspaceId is null, recipientId is set.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";

export interface IReaction {
  emoji: string;
  userId: mongoose.Types.ObjectId;
}

export interface IMessage extends Document {
  /** Set for group workspace chat; null for DMs */
  workspaceId?: mongoose.Types.ObjectId;
  /** The user who sent the message */
  senderId: mongoose.Types.ObjectId;
  /** Set for 1-on-1 DMs; null for group chat */
  recipientId?: mongoose.Types.ObjectId;
  content: string;
  /** References to uploaded File documents attached to this message */
  attachments: mongoose.Types.ObjectId[];
  /** @mentioned user IDs within the message content */
  mentions: mongoose.Types.ObjectId[];
  /** Emoji reactions added by other users */
  reactions: IReaction[];
  /** Whether the message was edited after sending */
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    emoji: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false } // reactions don't need their own _id
);

const messageSchema = new Schema<IMessage>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message sender is required"],
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [3000, "Message must be at most 3000 characters"],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: "File",
      },
    ],
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [reactionSchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    // Messages have a createdAt but are never bulk-updated (hence no updatedAt)
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Group chat: fetch messages for a workspace in chronological order
messageSchema.index({ workspaceId: 1, createdAt: 1 });

// DM conversation: fetch messages between two users in order
// The pair (senderId, recipientId) uniquely identifies a conversation
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 });
messageSchema.index({ recipientId: 1, senderId: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
