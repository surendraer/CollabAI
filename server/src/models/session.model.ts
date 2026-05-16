import mongoose, { Schema, Document } from "mongoose";
import { TokenExpiry } from "../constants";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + TokenExpiry.REFRESH_TOKEN),
    },
  },
  {
    timestamps: true,
  }
);

// TTL index — MongoDB automatically deletes expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ refreshToken: 1 });

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
