import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import config from "./index";
import logger from "../utils/logger";
import dns from "dns";

let memoryServer: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  try {
    const uri =
      config.db.uri === "memory"
        ? await getMemoryMongoUri()
        : config.db.uri;

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    logger.info(`📦 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);

    // Graceful fallback: if Atlas/external URI fails in development, try in-memory
    if (config.db.uri !== "memory" && config.nodeEnv !== "production") {
      logger.warn("⚠️  Falling back to in-memory MongoDB for local development...");
      try {
        const memUri = await getMemoryMongoUri();
        const conn = await mongoose.connect(memUri);
        logger.info(`📦 MongoDB connected (in-memory): ${conn.connection.host}`);
        logger.warn("ℹ️  Data will NOT persist across restarts. Fix your MONGODB_URI for persistent storage.");
      } catch (fallbackError) {
        logger.error("❌ In-memory MongoDB fallback also failed:", fallbackError);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
};

const getMemoryMongoUri = async (): Promise<string> => {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 120000,
      },
    });
    logger.warn(
      "⚠️ MONGODB_URI=memory — Using in-memory MongoDB for local development."
    );
  }

  return memoryServer.getUri();
};

export default connectDB;
