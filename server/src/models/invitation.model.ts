import mongoose, { Schema, Document } from "mongoose";
import { WorkspaceRoles } from "../constants";
import type { WorkspaceRole } from "../constants";

export interface IInvitation extends Document {
  workspaceId: mongoose.Types.ObjectId;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace ID is required"],
    },
    email: {
      type: String,
      required: [true, "Invited email is required"],
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(WorkspaceRoles),
      default: WorkspaceRoles.MEMBER,
    },
    token: {
      type: String,
      required: [true, "Invitation token is required"],
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Invited by User ID is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
invitationSchema.index({ workspaceId: 1 });
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ email: 1 });

const Invitation = mongoose.model<IInvitation>("Invitation", invitationSchema);

export default Invitation;
