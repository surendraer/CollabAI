import api from "./axios";

export const notificationApi = {
  getNotifications: () => api.get("/notifications"),

  markAsRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: () => api.patch("/notifications/read-all"),
};
