// ============================================================
// models/meetingNote.model.ts
// A collaborative markdown document (lab journal) per workspace.
// Multiple members can read/write. We store the full Markdown
// content as a string; the frontend renders it with a markdown
// editor. Real-time syncing is handled via Socket.IO events.
// ============================================================
import mongoose, { Schema, Document } from "mongoose";

export interface IMeetingNote extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  /** Short title shown in the notes list, e.g. "Lab Meeting 2026-07-06" */
  title: string;
  /** Full Markdown content of the note */
  content: string;
  /** The last user to save edits */
  lastEditedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const meetingNoteSchema = new Schema<IMeetingNote>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace reference is required"],
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Last editor reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

meetingNoteSchema.index({ workspaceId: 1, updatedAt: -1 });

const MeetingNote = mongoose.model<IMeetingNote>("MeetingNote", meetingNoteSchema);

export default MeetingNote;
