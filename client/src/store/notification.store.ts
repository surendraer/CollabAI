import { create } from "zustand";

interface NotificationState {
  notifications: any[];
  unreadCount: number;
  setNotifications: (notifications: any[]) => void;
  addNotification: (notification: any) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead && !n.read).length,
    }),

  addNotification: (notification) =>
    set((state) => {
      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead && !n.read).length,
      };
    }),

  markRead: (notificationId) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n._id === notificationId ? { ...n, isRead: true, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead && !n.read).length,
      };
    }),

  markAllRead: () =>
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true, read: true }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    }),
}));
