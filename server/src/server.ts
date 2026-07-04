// ─── DNS Configuration ───
// Force IPv4 + override DNS servers to Google/Cloudflare.
// This fixes the querySrv ECONNREFUSED error for MongoDB Atlas on ISPs
// that block SRV record lookups — no Windows/system DNS changes needed.
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

import http from "http";
import app from "./app";
import config from "./config";
import connectDB from "./config/db";
import logger from "./utils/logger";
import SocketService from "./services/socket.service";


const startServer = async () => {
  try {
    logger.info(`Received process.env.PORT: "${process.env.PORT}"`);
    // Connect to MongoDB
    await connectDB();

    // Create HTTP Server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    SocketService.init(httpServer);

    // Start HTTP server
    const server = httpServer.listen(config.port, () => {
      logger.info(
        `🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`
      );
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error("Forced shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle unhandled rejections
    process.on("unhandledRejection", (reason: Error) => {
      logger.error("Unhandled Rejection:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
