import api from "./axios";

export const analyticsApi = {
  getWorkspaceAnalytics: (workspaceId: string) =>
    api.get(`/analytics/workspace/${workspaceId}`),
};
