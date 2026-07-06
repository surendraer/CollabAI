// ============================================================
// models/workspace.model.ts
// A Workspace represents one research paper or project.
// Every workspace belongs to a Lab. The lab's role hierarchy
// applies by default; workspace-specific overrides use Member.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";
import { WorkspaceType, WorkspaceStatus } from "../constants";
import type { WorkspaceTypeValue } from "../constants";

export interface IWorkspace extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  /** The lab this workspace belongs to */
  labId: mongoose.Types.ObjectId;
  /** The user who created / owns this workspace */
  ownerId: mongoose.Types.ObjectId;
  /** "paper" or "project" — informs the UI's default pipeline template */
  type: WorkspaceTypeValue;
  /** Current lifecycle state of the workspace */
  status: "active" | "completed" | "archived";
  /** Searchable academic field tags, e.g. ["NLP", "ML", "Computer Vision"] */
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      maxlength: [100, "Workspace name must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    labId: {
      type: Schema.Types.ObjectId,
      ref: "Lab",
      required: [true, "Lab reference is required"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Workspace owner is required"],
    },
    type: {
      type: String,
      enum: Object.values(WorkspaceType),
      default: WorkspaceType.PAPER,
    },
    status: {
      type: String,
      enum: Object.values(WorkspaceStatus),
      default: WorkspaceStatus.ACTIVE,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Fast retrieval of all workspaces within a lab
workspaceSchema.index({ labId: 1, status: 1 });

const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
