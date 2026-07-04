import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message must be at most 2000 characters"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Chat logs are immutable
  }
);

messageSchema.index({ workspaceId: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
