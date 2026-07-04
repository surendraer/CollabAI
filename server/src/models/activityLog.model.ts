import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace reference is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    action: {
      type: String,
      required: [true, "Action description is required"],
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log creation time
  }
);

activityLogSchema.index({ workspaceId: 1, createdAt: -1 });

const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLog;
