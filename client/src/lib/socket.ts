import { io, Socket } from "socket.io-client";
import { useWorkspaceStore } from "../store/workspace.store";
import { useNotificationStore } from "../store/notification.store";

const getSocketUrl = () => {
  const isProduction = import.meta.env.PROD || window.location.hostname !== "localhost";
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL || "";
  const envApiUrl = import.meta.env.VITE_API_URL || "";

  // In production, if the socket URL is empty or points to localhost, derive it from the API URL
  if (isProduction && (envSocketUrl.includes("localhost") || !envSocketUrl)) {
    if (envApiUrl && !envApiUrl.includes("localhost")) {
      return envApiUrl.replace(/\/api$/, "");
    }
  }

  return envSocketUrl || "http://localhost:5000";
};

const SOCKET_URL = getSocketUrl();

class SocketClient {
  private socket: Socket | null = null;

  public connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to CollabAI real-time server at:", SOCKET_URL);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 Real-time server connection error:", error.message);
    });

    // Real-time notifications
    this.socket.on("notification:received", (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    // Real-time presence indicators
    this.socket.on("workspace:user_active", (data: { userId: string }) => {
      useWorkspaceStore.getState().addOnlineUser(data.userId);
    });

    this.socket.on("workspace:user_inactive", (data: { userId: string }) => {
      useWorkspaceStore.getState().removeOnlineUser(data.userId);
    });

    this.socket.on("presence:offline", (data: { userId: string }) => {
      useWorkspaceStore.getState().removeOnlineUser(data.userId);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from CollabAI real-time server");
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinWorkspace(workspaceId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("workspace:join", workspaceId);
    }
  }

  public leaveWorkspace(workspaceId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("workspace:leave", workspaceId);
    }
  }
}

export const socketClient = new SocketClient();
export default socketClient;
