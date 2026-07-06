import Pusher from "pusher";
import config from "../config";
import logger from "./logger";

let pusherInstance: Pusher | null = null;

export const getPusher = (): Pusher | null => {
  if (pusherInstance) return pusherInstance;

  if (!config.pusher.appId || !config.pusher.key || !config.pusher.secret) {
    return null;
  }

  pusherInstance = new Pusher({
    appId: config.pusher.appId,
    key: config.pusher.key,
    secret: config.pusher.secret,
    cluster: config.pusher.cluster,
    useTLS: true,
  });

  logger.info("✅ Pusher initialized — real-time messaging ready");
  return pusherInstance;
};

export const isPusherConfigured = (): boolean => {
  return !!(config.pusher.appId && config.pusher.key && config.pusher.secret);
};

export const triggerPusher = async (
  channel: string,
  event: string,
  data: Record<string, any>
): Promise<void> => {
  const pusher = getPusher();
  if (!pusher) {
    return;
  }
  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    logger.error("Pusher trigger failed:", error);
  }
};
