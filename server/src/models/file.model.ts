// ============================================================
// models/file.model.ts
// Tracks files uploaded to Cloudinary (or S3 in future).
// Files can be attached to workspaces, tasks, or messages.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";

export interface IFile extends Document {
  _id: mongoose.Types.ObjectId;
  /** The workspace this file belongs to (null if attached directly to a DM) */
  workspaceId?: mongoose.Types.ObjectId;
  /** Optional — links file to a specific task */
  taskId?: mongoose.Types.ObjectId;
  /** The user who uploaded the file */
  uploadedBy: mongoose.Types.ObjectId;
  /** Original filename from the client */
  originalName: string;
  /** Public URL from Cloudinary or S3 */
  storageUrl: string;
  /** Provider-specific public ID, used to delete from storage */
  storagePublicId: string;
  /** MIME type, e.g. "application/pdf", "image/png" */
  mimeType: string;
  /** File size in bytes */
  sizeBytes: number;
  createdAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
    },
    storageUrl: {
      type: String,
      required: [true, "Storage URL is required"],
    },
    storagePublicId: {
      type: String,
      required: [true, "Storage public ID is required"],
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
    },
    sizeBytes: {
      type: Number,
      required: [true, "File size is required"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

fileSchema.index({ workspaceId: 1, createdAt: -1 });
fileSchema.index({ taskId: 1 });
fileSchema.index({ uploadedBy: 1 });

const File = mongoose.model<IFile>("File", fileSchema);

export default File;
