import PusherJS from "pusher-js";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || "";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || "mt1";

let pusherInstance: PusherJS | null = null;

export const getPusherClient = (): PusherJS | null => {
  if (pusherInstance) return pusherInstance;
  if (!PUSHER_KEY) return null;

  pusherInstance = new PusherJS(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
  });

  pusherInstance.connection.bind("connected", () => {
    console.log("⚡ Pusher connected — real-time messaging active");
  });

  pusherInstance.connection.bind("error", (err: any) => {
    console.error("⚡ Pusher connection error:", err);
  });

  return pusherInstance;
};

export const isPusherConfigured = (): boolean => !!PUSHER_KEY;

export const subscribeToChatChannel = (
  workspaceId: string,
  onMessage: (data: { message: any }) => void
): (() => void) => {
  const pusher = getPusherClient();
  if (!pusher) return () => {};

  const channelName = `workspace-${workspaceId}`;
  const channel = pusher.subscribe(channelName);
  channel.bind("chat:message", onMessage);

  return () => {
    channel.unbind("chat:message", onMessage);
    pusher.unsubscribe(channelName);
  };
};
