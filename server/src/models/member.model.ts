import mongoose, { Schema, Document } from "mongoose";
import { WorkspaceRoles } from "../constants";
import type { WorkspaceRole } from "../constants";

export interface IMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  joinedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    role: {
      type: String,
      enum: Object.values(WorkspaceRoles),
      default: WorkspaceRoles.MEMBER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Composite unique index to prevent duplicate memberships
memberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
// Index for query speed on user memberships
memberSchema.index({ userId: 1 });

const Member = mongoose.model<IMember>("Member", memberSchema);

export default Member;
