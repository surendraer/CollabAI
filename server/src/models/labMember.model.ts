// ============================================================
// models/labMember.model.ts
// Maps users to labs with a role. The LabMember role determines
// what the user can do in all workspaces under the lab, unless
// a workspace-level override exists.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";
import { LabRoles } from "../constants";
import type { LabRole } from "../constants";

export interface ILabMember extends Document {
  labId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: LabRole;
  /** Timestamp the user joined or was added to the lab */
  joinedAt: Date;
}

const labMemberSchema = new Schema<ILabMember>(
  {
    labId: {
      type: Schema.Types.ObjectId,
      ref: "Lab",
      required: [true, "Lab ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    role: {
      type: String,
      enum: Object.values(LabRoles),
      default: LabRoles.RESEARCHER,
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

// Prevent duplicate membership in the same lab
labMemberSchema.index({ labId: 1, userId: 1 }, { unique: true });

// Fast lookup for all labs a user belongs to
labMemberSchema.index({ userId: 1 });

const LabMember = mongoose.model<ILabMember>("LabMember", labMemberSchema);

export default LabMember;
