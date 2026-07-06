// ============================================================
// models/task.model.ts
// Represents a single deliverable (task or milestone) within a
// workspace. Tasks now reference a PipelineStage instead of a
// hardcoded status string. Multiple assignees are supported.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";
import { TaskPriority, TaskType } from "../constants";
import type { TaskPriorityType, TaskTypeValue } from "../constants";

// ===== Sub-document interfaces =====

export interface ISubtask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  isCompleted: boolean;
  /** Optional specific assignee for this sub-item */
  assigneeId?: mongoose.Types.ObjectId;
}

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  /** @mentioned user IDs within the comment body */
  mentions: mongoose.Types.ObjectId[];
  /** Whether this comment was edited after creation */
  isEdited: boolean;
  createdAt: Date;
}

// ===== Main Task interface =====

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  /** References a PipelineStage — replaces hardcoded status enum */
  stageId: mongoose.Types.ObjectId;
  /** "task" for day-to-day items, "milestone" for major paper checkpoints */
  type: TaskTypeValue;
  /** Supports multiple assignees (common in co-authored work) */
  assigneeIds: mongoose.Types.ObjectId[];
  priority: TaskPriorityType;
  dueDate?: Date;
  /** In-app reminder, sent 24h before if set */
  reminderAt?: Date;
  /** Free-form labels, e.g. ["literature", "writing", "review"] */
  labels: string[];
  /** References to uploaded File documents */
  attachments: mongoose.Types.ObjectId[];
  subtasks: ISubtask[];
  comments: IComment[];
  /** Position within the pipeline stage column (for drag-and-drop ordering) */
  columnOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Sub-document schemas =====

const subtaskSchema = new Schema<ISubtask>({
  title: {
    type: String,
    required: [true, "Subtask title is required"],
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  assigneeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const commentSchema = new Schema<IComment>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Comment sender is required"],
  },
  content: {
    type: String,
    required: [true, "Comment content is required"],
    trim: true,
    maxlength: [3000, "Comment must be at most 3000 characters"],
  },
  mentions: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isEdited: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ===== Main Task schema =====

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [150, "Task title must be at most 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Task description must be at most 5000 characters"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace reference is required"],
    },
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "PipelineStage",
      required: [true, "Pipeline stage reference is required"],
    },
    type: {
      type: String,
      enum: Object.values(TaskType),
      default: TaskType.TASK,
    },
    assigneeIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    reminderAt: {
      type: Date,
    },
    labels: {
      type: [String],
      default: [],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: "File",
      },
    ],
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    columnOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient board queries
taskSchema.index({ workspaceId: 1, stageId: 1, columnOrder: 1 });
taskSchema.index({ workspaceId: 1, dueDate: 1 });
taskSchema.index({ assigneeIds: 1 });

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
