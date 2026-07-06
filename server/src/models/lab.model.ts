// ============================================================
// models/lab.model.ts
// A Lab is the top-level container created by a PI (Principal
// Investigator). One lab can contain multiple Workspaces (papers
// or projects). Users belong to a lab with a defined role.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";

export interface ILab extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  /** The PI who owns and controls this lab */
  ownerId: mongoose.Types.ObjectId;
  /** Optional institution name (e.g. "MIT CSAIL") */
  institution?: string;
  /** Optional logo URL (uploaded via file service) */
  logoUrl?: string;
  /** Soft-deleted labs are archived, not removed */
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const labSchema = new Schema<ILab>(
  {
    name: {
      type: String,
      required: [true, "Lab name is required"],
      trim: true,
      maxlength: [100, "Lab name must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lab owner is required"],
    },
    institution: {
      type: String,
      trim: true,
      maxlength: [200, "Institution name must be at most 200 characters"],
    },
    logoUrl: {
      type: String,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quickly finding all labs owned by a user
labSchema.index({ ownerId: 1 });

const Lab = mongoose.model<ILab>("Lab", labSchema);

export default Lab;
