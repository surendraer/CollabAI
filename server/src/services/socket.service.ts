import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config";
import { checkOrigin } from "../config/cors";
import User from "../models/user.model";
import logger from "../utils/logger";

interface SocketUser {
  userId: string;
  name: string;
  avatar: string;
}

export class SocketService {
  private static io: Server | null = null;
  // Map of socket ID to SocketUser
  private static activeUsers = new Map<string, SocketUser>();
  // Map of userId to Set of socket IDs (to handle multiple tabs)
  private static userSockets = new Map<string, Set<string>>();

  public static init(server: HttpServer): Server {
    this.io = new Server(server, {
      cors: {
        origin: checkOrigin,
        credentials: true,
        methods: ["GET", "POST"],
      },
      pingTimeout: 60000,
    });

    // Authentication middleware
    this.io.use(async (socket: Socket, next) => {
      try {
        let token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
          socket.handshake.query?.token;

        if (!token && socket.handshake.headers.cookie) {
          const cookieMatch = socket.handshake.headers.cookie.match(/accessToken=([^;]+)/);
          if (cookieMatch) {
            token = cookieMatch[1];
          }
        }

        if (!token || typeof token !== "string") {
          return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
        const user = await User.findById(decoded.userId).select("name avatar");

        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        socket.data.user = {
          userId: user._id.toString(),
          name: user.name,
          avatar: user.avatar,
        };

        next();
      } catch (err) {
        next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", (socket: Socket) => {
      const user = socket.data.user as SocketUser;
      const socketId = socket.id;

      logger.info(`🔌 Socket connected: ${user.name} (${socketId})`);

      // Track online status
      const isNewConnection = !this.userSockets.has(user.userId);
      this.activeUsers.set(socketId, user);
      if (!this.userSockets.has(user.userId)) {
        this.userSockets.set(user.userId, new Set());
      }
      this.userSockets.get(user.userId)!.add(socketId);

      if (isNewConnection) {
        // Broadcast presence online to everyone
        this.io?.emit("presence:online", {
          userId: user.userId,
          name: user.name,
          avatar: user.avatar,
        });
      }

      // Join personal room for targeting notifications
      socket.join(`user:${user.userId}`);

      // Handle joining workspace room
      socket.on("workspace:join", (workspaceId: string) => {
        socket.join(`workspace:${workspaceId}`);
        logger.info(`👤 ${user.name} joined workspace: ${workspaceId}`);
        // Notify others in room
        socket.to(`workspace:${workspaceId}`).emit("workspace:user_active", {
          userId: user.userId,
          name: user.name,
          avatar: user.avatar,
        });
      });

      // Handle leaving workspace room
      socket.on("workspace:leave", (workspaceId: string) => {
        socket.leave(`workspace:${workspaceId}`);
        logger.info(`👤 ${user.name} left workspace: ${workspaceId}`);
        socket.to(`workspace:${workspaceId}`).emit("workspace:user_inactive", {
          userId: user.userId,
        });
      });

      // Typing indicators
      socket.on("typing:start", (data: { workspaceId: string; taskId?: string; projectId?: string }) => {
        socket.to(`workspace:${data.workspaceId}`).emit("typing:start", {
          userId: user.userId,
          name: user.name,
          taskId: data.taskId,
          projectId: data.projectId,
        });
      });

      socket.on("typing:stop", (data: { workspaceId: string; taskId?: string; projectId?: string }) => {
        socket.to(`workspace:${data.workspaceId}`).emit("typing:stop", {
          userId: user.userId,
          taskId: data.taskId,
          projectId: data.projectId,
        });
      });

      // Disconnect handling
      socket.on("disconnect", () => {
        logger.info(`🔌 Socket disconnected: ${user.name} (${socketId})`);
        
        this.activeUsers.delete(socketId);
        const userSet = this.userSockets.get(user.userId);
        if (userSet) {
          userSet.delete(socketId);
          if (userSet.size === 0) {
            this.userSockets.delete(user.userId);
            // User is completely offline (closed all tabs)
            // Broadcast offline state to all rooms
            this.io?.emit("presence:offline", { userId: user.userId });
          }
        }
      });
    });

    return this.io;
  }

  // Helper method to emit events to workspaces
  public static emitToWorkspace(workspaceId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`workspace:${workspaceId}`).emit(event, data);
    }
  }

  // Helper method to emit notifications to specific users
  public static emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Helper method to check if a user is online
  public static isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get list of currently online user IDs
  public static getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

export default SocketService;
