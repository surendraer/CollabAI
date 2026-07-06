// ============================================================
// models/pipelineStage.model.ts
// Replaces the hardcoded status enum ("todo"/"in-progress"/"done")
// with owner-configurable stages per workspace. The PI or Admin
// can create, rename, recolor, and reorder stages freely.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";

export interface IPipelineStage extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  /** Display name, e.g. "Literature Review", "Draft", "Peer Review" */
  name: string;
  /** Hex color for the column header, e.g. "#0066cc" */
  color: string;
  /** Position index used to order columns left-to-right */
  order: number;
  /**
   * Whether this stage is the default placement for newly created tasks.
   * Only one stage per workspace should have isDefault=true.
   */
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pipelineStageSchema = new Schema<IPipelineStage>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace reference is required"],
    },
    name: {
      type: String,
      required: [true, "Stage name is required"],
      trim: true,
      maxlength: [50, "Stage name must be at most 50 characters"],
    },
    color: {
      type: String,
      default: "#8e8e93",
      match: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a valid hex value"],
    },
    order: {
      type: Number,
      required: [true, "Stage order is required"],
      min: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Fast retrieval of all stages in a workspace, sorted by order
pipelineStageSchema.index({ workspaceId: 1, order: 1 });

const PipelineStage = mongoose.model<IPipelineStage>("PipelineStage", pipelineStageSchema);

export default PipelineStage;
