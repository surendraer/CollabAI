import mongoose, { Schema, Document } from "mongoose";

export interface ISubtask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  isCompleted: boolean;
}

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done";
  dueDate?: Date;
  columnOrder: number;
  subtasks: ISubtask[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    dueDate: {
      type: Date,
    },
    columnOrder: {
      type: Number,
      default: 0,
    },
    subtasks: [subtaskSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast project-board query queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ workspaceId: 1 });
taskSchema.index({ assigneeId: 1 });

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
